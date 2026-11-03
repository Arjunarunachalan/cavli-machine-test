
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

    const { consultationId, scheduledAt } = validation.data;
    const selectedDate = new Date(scheduledAt);

    if (selectedDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, message: "Please select a future time slot." },
        { status: 400 }
      );
    }

    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: { scheduledAt },
      select: {
        id: true,
        name: true,
        email: true,
        scheduledAt: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment slot reserved successfully.",
      data: consultation,
    });
  } catch (error) {
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

    console.error("Appointment booking failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reserve this appointment.",
      },
      { status: 500 }
    );
  }
}

