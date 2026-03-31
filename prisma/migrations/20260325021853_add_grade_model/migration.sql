-- CreateEnum
CREATE TYPE "public"."CalendarEventType" AS ENUM ('GENERAL', 'EXAM', 'ASSIGNMENT', 'HOLIDAY', 'MEETING', 'OTHER');

-- CreateTable
CREATE TABLE "public"."CalendarEvent" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."CalendarEventType" NOT NULL DEFAULT 'GENERAL',
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalendarEventTarget" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "type" "public"."PostTargetType" NOT NULL,
    "role" "public"."UserRole",
    "courseId" UUID,

    CONSTRAINT "CalendarEventTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarEvent_institutionId_date_idx" ON "public"."CalendarEvent"("institutionId", "date");

-- CreateIndex
CREATE INDEX "CalendarEvent_createdByUserId_idx" ON "public"."CalendarEvent"("createdByUserId");

-- CreateIndex
CREATE INDEX "CalendarEventTarget_eventId_idx" ON "public"."CalendarEventTarget"("eventId");

-- CreateIndex
CREATE INDEX "CalendarEventTarget_type_courseId_idx" ON "public"."CalendarEventTarget"("type", "courseId");

-- AddForeignKey
ALTER TABLE "public"."CalendarEvent" ADD CONSTRAINT "CalendarEvent_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CalendarEventTarget" ADD CONSTRAINT "CalendarEventTarget_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CalendarEventTarget" ADD CONSTRAINT "CalendarEventTarget_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
