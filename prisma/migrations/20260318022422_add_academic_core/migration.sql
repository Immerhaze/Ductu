-- CreateEnum
CREATE TYPE "public"."AcademicRegime" AS ENUM ('SEMESTER', 'TRIMESTER', 'QUARTER');

-- CreateTable
CREATE TABLE "public"."InstitutionAcademicPolicy" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicRegime" "public"."AcademicRegime" NOT NULL DEFAULT 'SEMESTER',
    "gradingScaleMin" DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    "gradingScaleMax" DECIMAL(3,1) NOT NULL DEFAULT 7.0,
    "passingGrade" DECIMAL(3,1) NOT NULL DEFAULT 4.0,
    "gradeDecimals" INTEGER NOT NULL DEFAULT 1,
    "useAttendanceForPromotion" BOOLEAN NOT NULL DEFAULT true,
    "minimumAttendancePercent" DECIMAL(5,2),
    "activeAcademicYearId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionAcademicPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademicYear" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademicPeriod" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseSubject" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeachingAssignment" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionAcademicPolicy_institutionId_key" ON "public"."InstitutionAcademicPolicy"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionAcademicPolicy_institutionId_idx" ON "public"."InstitutionAcademicPolicy"("institutionId");

-- CreateIndex
CREATE INDEX "AcademicYear_institutionId_isActive_idx" ON "public"."AcademicYear"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_institutionId_year_key" ON "public"."AcademicYear"("institutionId", "year");

-- CreateIndex
CREATE INDEX "AcademicPeriod_institutionId_idx" ON "public"."AcademicPeriod"("institutionId");

-- CreateIndex
CREATE INDEX "AcademicPeriod_academicYearId_isActive_idx" ON "public"."AcademicPeriod"("academicYearId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicPeriod_academicYearId_periodNumber_key" ON "public"."AcademicPeriod"("academicYearId", "periodNumber");

-- CreateIndex
CREATE INDEX "Subject_institutionId_isActive_idx" ON "public"."Subject"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_institutionId_name_key" ON "public"."Subject"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_institutionId_code_key" ON "public"."Subject"("institutionId", "code");

-- CreateIndex
CREATE INDEX "CourseSubject_institutionId_idx" ON "public"."CourseSubject"("institutionId");

-- CreateIndex
CREATE INDEX "CourseSubject_courseId_idx" ON "public"."CourseSubject"("courseId");

-- CreateIndex
CREATE INDEX "CourseSubject_subjectId_idx" ON "public"."CourseSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSubject_courseId_subjectId_key" ON "public"."CourseSubject"("courseId", "subjectId");

-- CreateIndex
CREATE INDEX "TeachingAssignment_institutionId_idx" ON "public"."TeachingAssignment"("institutionId");

-- CreateIndex
CREATE INDEX "TeachingAssignment_teacherId_idx" ON "public"."TeachingAssignment"("teacherId");

-- CreateIndex
CREATE INDEX "TeachingAssignment_courseId_idx" ON "public"."TeachingAssignment"("courseId");

-- CreateIndex
CREATE INDEX "TeachingAssignment_subjectId_idx" ON "public"."TeachingAssignment"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingAssignment_academicYearId_teacherId_courseId_subjec_key" ON "public"."TeachingAssignment"("academicYearId", "teacherId", "courseId", "subjectId");

-- AddForeignKey
ALTER TABLE "public"."InstitutionAcademicPolicy" ADD CONSTRAINT "InstitutionAcademicPolicy_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstitutionAcademicPolicy" ADD CONSTRAINT "InstitutionAcademicPolicy_activeAcademicYearId_fkey" FOREIGN KEY ("activeAcademicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicYear" ADD CONSTRAINT "AcademicYear_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicPeriod" ADD CONSTRAINT "AcademicPeriod_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicPeriod" ADD CONSTRAINT "AcademicPeriod_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSubject" ADD CONSTRAINT "CourseSubject_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSubject" ADD CONSTRAINT "CourseSubject_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSubject" ADD CONSTRAINT "CourseSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
