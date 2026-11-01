import { NextResponse } from "next/server";
import {
  fetchAllExhibitors,
  fetchAllCategories,
} from "@/lib/scraper/mmi-client";
import { importExhibitors } from "@/lib/scraper/import-exhibitors";
import { importCategories } from "@/lib/scraper/import-categories";

export async function POST() {
  try {
    console.log("Starting MMI scraping...");

    // Fetch exhibitors and categories from MMI.
    const [exhibitors, categories] = await Promise.all([
      fetchAllExhibitors(),
      fetchAllCategories(),
    ]);

    console.log(`Fetched ${exhibitors.length} exhibitors`);
    console.log(`Fetched ${categories.length} categories`);

    // Import exhibitors and their event relationships.
    const exhibitorResult = await importExhibitors(exhibitors);

    // Import category records.
    const categoryResult = await importCategories(categories);

    return NextResponse.json({
      success: true,
      message: "MMI exhibitors and categories imported successfully",
      totalExhibitors: exhibitorResult.totalExhibitors,
      totalEvents: exhibitorResult.totalEvents,
      totalCategories: categoryResult.totalCategories,
    });
  } catch (error) {
    console.error("MMI scraping failed:", error);

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