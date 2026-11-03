-- CreateTable
CREATE TABLE "GoogleCalendarCredential" (
    "id" TEXT NOT NULL DEFAULT 'organizer',
    "email" TEXT,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCalendarCredential_pkey" PRIMARY KEY ("id")
);
