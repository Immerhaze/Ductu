/*
  Warnings:

  - You are about to drop the column `hundredsBase` on the `InstitutionCourseConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "chiefTeacherId" UUID;

-- AlterTable
ALTER TABLE "public"."InstitutionCourseConfig" DROP COLUMN "hundredsBase";

-- CreateTable
CREATE TABLE "public"."TeacherCourse" (
    "id" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherCourse_institutionId_idx" ON "public"."TeacherCourse"("institutionId");

-- CreateIndex
CREATE INDEX "TeacherCourse_teacherId_idx" ON "public"."TeacherCourse"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherCourse_courseId_idx" ON "public"."TeacherCourse"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherCourse_teacherId_courseId_key" ON "public"."TeacherCourse"("teacherId", "courseId");

-- CreateIndex
CREATE INDEX "Course_chiefTeacherId_idx" ON "public"."Course"("chiefTeacherId");

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_chiefTeacherId_fkey" FOREIGN KEY ("chiefTeacherId") REFERENCES "public"."AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherCourse" ADD CONSTRAINT "TeacherCourse_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherCourse" ADD CONSTRAINT "TeacherCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherCourse" ADD CONSTRAINT "TeacherCourse_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
