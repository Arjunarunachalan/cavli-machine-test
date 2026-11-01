import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      events,
      exhibitors,
      eventExhibitors,
      categories,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.exhibitor.count(),
      prisma.eventExhibitor.count(),
      prisma.category.count(),
    ]);

    return NextResponse.json({
      success: true,
      database: "Connected",
      tables: {
        events,
        exhibitors,
        eventExhibitors,
        categories,
      },
    });
  } catch (error) {
    console.error("Database verification failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}