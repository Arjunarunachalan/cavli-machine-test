
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
