-- CreateTable
CREATE TABLE "public"."Grade" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "teachingAssignmentId" UUID NOT NULL,
    "academicPeriodId" UUID NOT NULL,
    "value" DECIMAL(3,1) NOT NULL,
    "title" TEXT,
    "weight" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Grade_institutionId_idx" ON "public"."Grade"("institutionId");

-- CreateIndex
CREATE INDEX "Grade_studentId_idx" ON "public"."Grade"("studentId");

-- CreateIndex
CREATE INDEX "Grade_teachingAssignmentId_idx" ON "public"."Grade"("teachingAssignmentId");

-- CreateIndex
CREATE INDEX "Grade_academicPeriodId_idx" ON "public"."Grade"("academicPeriodId");

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "public"."TeachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "public"."AcademicPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
