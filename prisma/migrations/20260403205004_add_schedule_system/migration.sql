-- CreateTable
CREATE TABLE "public"."ScheduleBlock" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScheduleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseSchedule" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScheduleSlot" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "courseScheduleId" UUID NOT NULL,
    "blockId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "subjectId" UUID,
    "teacherId" UUID,
    "room" TEXT,

    CONSTRAINT "ScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleBlock_institutionId_idx" ON "public"."ScheduleBlock"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleBlock_institutionId_order_key" ON "public"."ScheduleBlock"("institutionId", "order");

-- CreateIndex
CREATE INDEX "CourseSchedule_institutionId_idx" ON "public"."CourseSchedule"("institutionId");

-- CreateIndex
CREATE INDEX "CourseSchedule_courseId_idx" ON "public"."CourseSchedule"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSchedule_institutionId_courseId_academicYearId_key" ON "public"."CourseSchedule"("institutionId", "courseId", "academicYearId");

-- CreateIndex
CREATE INDEX "ScheduleSlot_institutionId_idx" ON "public"."ScheduleSlot"("institutionId");

-- CreateIndex
CREATE INDEX "ScheduleSlot_courseScheduleId_idx" ON "public"."ScheduleSlot"("courseScheduleId");

-- CreateIndex
CREATE INDEX "ScheduleSlot_teacherId_idx" ON "public"."ScheduleSlot"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_courseScheduleId_blockId_dayOfWeek_key" ON "public"."ScheduleSlot"("courseScheduleId", "blockId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "public"."ScheduleBlock" ADD CONSTRAINT "ScheduleBlock_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSchedule" ADD CONSTRAINT "CourseSchedule_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSchedule" ADD CONSTRAINT "CourseSchedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSchedule" ADD CONSTRAINT "CourseSchedule_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_courseScheduleId_fkey" FOREIGN KEY ("courseScheduleId") REFERENCES "public"."CourseSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "public"."ScheduleBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
