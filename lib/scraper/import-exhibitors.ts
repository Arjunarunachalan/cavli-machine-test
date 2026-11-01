import { prisma } from "@/lib/prisma";
import type { MMIExhibitor } from "./types";

const BATCH_SIZE = 25;

export async function importExhibitors(
  exhibitors: MMIExhibitor[]
) {
  // 1. Extract unique events from the MMI response.
  const uniqueEvents = new Map(
    exhibitors.map(({ customer }) => [
      customer.showId,
      customer.show,
    ])
  );

  // 2. Insert or update events.
  const eventIdMap = new Map<number, number>();

  for (const [sourceId, show] of uniqueEvents) {
    const event = await prisma.event.upsert({
      where: { sourceId },
      create: {
        sourceId,
        name: show.showName,
        startDate: new Date(show.startDate),
        endDate: new Date(show.endDate),
      },
      update: {
        name: show.showName,
        startDate: new Date(show.startDate),
        endDate: new Date(show.endDate),
      },
    });

    eventIdMap.set(sourceId, event.id);
  }

  // 3. Process exhibitors in manageable batches.
  for (let i = 0; i < exhibitors.length; i += BATCH_SIZE) {
    const batch = exhibitors.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async ({ customer }) => {
        const eventId = eventIdMap.get(customer.showId);

        if (!eventId) {
          throw new Error(
            `Event not found for MMI show ID ${customer.showId}`
          );
        }

        // Insert or update the company.
        const exhibitor = await prisma.exhibitor.upsert({
          where: {
            sourceId: customer.id,
          },
          create: {
            sourceId: customer.id,
            companyName: customer.companyName,
            country: customer.country,
            squareLogo: customer.squareLogo,
            userId: customer.userId,
          },
          update: {
            companyName: customer.companyName,
            country: customer.country,
            squareLogo: customer.squareLogo,
            userId: customer.userId,
          },
        });

        // Insert or update its participation in the event.
        const detail = customer.exhibitorDetail;

        await prisma.eventExhibitor.upsert({
          where: {
            eventId_exhibitorId: {
              eventId,
              exhibitorId: exhibitor.id,
            },
          },
          create: {
            eventId,
            exhibitorId: exhibitor.id,
            exhibitorType: detail?.exhibitorType ?? null,
            sponsorship: detail?.sponsorship ?? null,
            boothNo: detail?.boothNo ?? null,
            hallNo: detail?.hallNo ?? null,
          },
          update: {
            exhibitorType: detail?.exhibitorType ?? null,
            sponsorship: detail?.sponsorship ?? null,
            boothNo: detail?.boothNo ?? null,
            hallNo: detail?.hallNo ?? null,
          },
        });
      })
    );

    console.log(
      `Imported ${Math.min(i + BATCH_SIZE, exhibitors.length)} / ${exhibitors.length}`
    );
  }

  return {
    totalExhibitors: exhibitors.length,
    totalEvents: uniqueEvents.size,
  };
}
