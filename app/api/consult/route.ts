
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { getOrganizerCalendar } from "@/lib/google-calendar";

const consultationSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  message: z.string().trim().min(1, "Message is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const validation = consultationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please correct the form fields.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const consultation = await prisma.consultation.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone || null,
        company: validation.data.company || null,
        message: validation.data.message,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Consultation request submitted successfully.",
        data: consultation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Consultation submission failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit your consultation request.",
      },
      { status: 500 }
    );
  }
}

const TIME_ZONE = "Asia/Kolkata";
const BOOKING_DAYS = 14;

export async function GET() {
  try {
    const now = new Date();

    // Get today's calendar date in IST.
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);

    const year = Number(dateParts.find((p) => p.type === "year")?.value);
    const month = Number(dateParts.find((p) => p.type === "month")?.value);
    const day = Number(dateParts.find((p) => p.type === "day")?.value);

    const candidateSlots: Date[] = [];

    for (let offset = 0; offset < BOOKING_DAYS; offset++) {
      const calendarDate = new Date(
        Date.UTC(year, month - 1, day + offset)
      );

      const weekday = calendarDate.getUTCDay();

      // Skip Saturday and Sunday.
      if (weekday === 0 || weekday === 6) continue;

      const dateString = calendarDate.toISOString().slice(0, 10);

      // 10:00 AM to 4:30 PM, in 30-minute intervals.
      for (let minutes = 600; minutes < 1020; minutes += 30) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        const timeString =
          `${String(hours).padStart(2, "0")}:` +
          `${String(remainingMinutes).padStart(2, "0")}`;

        // Explicitly interpret the slot as IST.
        const slot = new Date(
          `${dateString}T${timeString}:00+05:30`
        );

        // Don't offer past or already-started slots.
        if (slot.getTime() <= now.getTime()) continue;

        candidateSlots.push(slot);
      }
    }

    const bookedSlots = await prisma.consultation.findMany({
      where: {
        scheduledAt: {
          in: candidateSlots,
        },
      },
      select: {
        scheduledAt: true,
      },
    });

    const bookedTimes = new Set(
      bookedSlots.map((booking) => booking.scheduledAt!.getTime())
    );

    const availableSlots = candidateSlots
      .filter((slot) => !bookedTimes.has(slot.getTime()))
      .map((slot) => ({
        start: slot.toISOString(),
        label: new Intl.DateTimeFormat("en-IN", {
          timeZone: TIME_ZONE,
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(slot),
      }));

    return NextResponse.json({
      success: true,
      timezone: TIME_ZONE,
      durationMinutes: 30,
      slots: availableSlots,
    });
  } catch (error) {
    console.error("Available slots lookup failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve available slots.",
      },
      { status: 500 }
    );
  }
}

const bookingSchema = z.object({
  consultationId: z.number().int().positive(),
  scheduledAt: z.string().datetime(),
});

export async function PATCH(request: NextRequest) {
  let consultationId: number | undefined;
  let slotReserved = false;

  try {
    const body: unknown = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking information.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { consultationId: id, scheduledAt } = validation.data;
    consultationId = id;

    const selectedDate = new Date(scheduledAt);

    if (selectedDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, message: "Please select a future time slot." },
        { status: 400 }
      );
    }

    // Reserve the slot only if this consultation has no booking yet.
    const reservation = await prisma.consultation.updateMany({
      where: {
        id,
        scheduledAt: null,
        calendarEventId: null,
        status: "PENDING",
      },
      data: {
        scheduledAt: selectedDate,
      },
    });

    if (reservation.count === 0) {
      const existing = await prisma.consultation.findUnique({
        where: { id },
        select: { id: true, scheduledAt: true },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Consultation request not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "This consultation already has a reserved slot.",
        },
        { status: 409 }
      );
    }

    slotReserved = true;

    const consultation = await prisma.consultation.findUniqueOrThrow({
      where: { id },
    });

    // Connect to the organizer's Google Calendar.
    const calendar = await getOrganizerCalendar();

    // Create a Calendar event and request a Google Meet conference.
    const calendarResponse = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: `Hubble Consultation - ${consultation.name}`,
        description: [
          `Name: ${consultation.name}`,
          `Email: ${consultation.email}`,
          `Phone: ${consultation.phone || "Not provided"}`,
          `Company: ${consultation.company || "Not provided"}`,
          "",
          "Message:",
          consultation.message,
        ].join("\n"),
        start: {
          dateTime: selectedDate.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: new Date(
            selectedDate.getTime() + 30 * 60 * 1000
          ).toISOString(),
          timeZone: "Asia/Kolkata",
        },
        attendees: [{ email: consultation.email }],
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
    });



    const calendarEventId = calendarResponse.data.id;

    if (!calendarEventId) {
      throw new Error("Google Calendar did not return an event ID.");
    }

    const meetLink =
      calendarResponse.data.hangoutLink ||
      calendarResponse.data.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === "video"
      )?.uri ||
      null;

    // Save the Calendar event and Meet link in PostgreSQL.
    const updatedConsultation = await prisma.consultation.update({
      where: { id },
      data: {
        calendarEventId,
        meetLink,
        status: "CONFIRMED",
      },
      select: {
        id: true,
        name: true,
        email: true,
        scheduledAt: true,
        status: true,
        calendarEventId: true,
        meetLink: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Consultation booked successfully.",
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Appointment booking failed:", error);

    // Release the slot if Calendar creation or database saving fails.
    if (slotReserved && consultationId !== undefined) {
      try {
        await prisma.consultation.updateMany({
          where: {
            id: consultationId,
            calendarEventId: null,
          },
          data: {
            scheduledAt: null,
            status: "PENDING",
          },
        });
      } catch (rollbackError) {
        console.error("Failed to release reserved slot:", rollbackError);
      }
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This time slot has already been booked. Please choose another.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete your booking. Please try again.",
      },
      { status: 500 }
    );
  }
}

