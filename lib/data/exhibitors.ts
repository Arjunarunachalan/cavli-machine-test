
import { prisma } from "@/lib/prisma";

export async function getExhibitorData() {
  try {
    const [total, featured] = await Promise.all([
      prisma.exhibitor.count(),
      prisma.exhibitor.findMany({
        select: {
          id: true,
          companyName: true,
          country: true,
          squareLogo: true,
        },
        orderBy: {
          companyName: "asc",
        },
        take: 8,
      }),
    ]);

    return { total, featured };
  } catch (error) {
    console.error("Failed to fetch exhibitors:", error);

    return {
      total: 0,
      featured: [],
    };
  }
}
