import { prisma } from "@/lib/prisma";
import type { MMICategory } from "./types";

const BATCH_SIZE = 25;

export async function importCategories(
  categories: MMICategory[]
) {
  for (let i = 0; i < categories.length; i += BATCH_SIZE) {
    const batch = categories.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map((category) =>
        prisma.category.upsert({
          where: {
            sourceId: category.id,
          },
          create: {
            sourceId: category.id,
            categoryType: category.categoryType,
            productCategoryType: category.productCategoryType,
            mainCategory: category.mainCategory,
            categoryName: category.categoryName,
            parentId: null,
          },
          update: {
            categoryType: category.categoryType,
            productCategoryType: category.productCategoryType,
            mainCategory: category.mainCategory,
            categoryName: category.categoryName,
            parentId: null,
          },
        })
      )
    );

    console.log(
      `Imported ${Math.min(i + BATCH_SIZE, categories.length)} / ${categories.length} categories`
    );
  }

  return {
    totalCategories: categories.length,
  };
}