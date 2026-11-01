-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exhibitor" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "country" TEXT,
    "squareLogo" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exhibitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventExhibitor" (
    "eventId" INTEGER NOT NULL,
    "exhibitorId" INTEGER NOT NULL,
    "exhibitorType" TEXT,
    "sponsorship" TEXT,
    "boothNo" TEXT,
    "hallNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventExhibitor_pkey" PRIMARY KEY ("eventId","exhibitorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_sourceId_key" ON "Event"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Exhibitor_sourceId_key" ON "Exhibitor"("sourceId");

-- AddForeignKey
ALTER TABLE "EventExhibitor" ADD CONSTRAINT "EventExhibitor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventExhibitor" ADD CONSTRAINT "EventExhibitor_exhibitorId_fkey" FOREIGN KEY ("exhibitorId") REFERENCES "Exhibitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
