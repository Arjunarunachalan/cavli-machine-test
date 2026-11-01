-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "categoryType" TEXT NOT NULL,
    "productCategoryType" TEXT NOT NULL,
    "mainCategory" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_sourceId_key" ON "Category"("sourceId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
