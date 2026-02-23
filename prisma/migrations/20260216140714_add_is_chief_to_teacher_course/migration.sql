/*
  Warnings:

  - You are about to drop the column `chiefTeacherId` on the `Course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_chiefTeacherId_fkey";

-- DropIndex
DROP INDEX "public"."AppUser_courseId_idx";

-- DropIndex
DROP INDEX "public"."AppUser_institutionId_idx";

-- DropIndex
DROP INDEX "public"."AppUser_role_idx";

-- DropIndex
DROP INDEX "public"."Course_chiefTeacherId_idx";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "chiefTeacherId";

-- AlterTable
ALTER TABLE "public"."Invitation" ADD COLUMN     "courseId" UUID;

-- AlterTable
ALTER TABLE "public"."TeacherCourse" ADD COLUMN     "isChief" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."InvitationCourseAssignment" (
    "id" UUID NOT NULL,
    "invitationId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "isChief" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InvitationCourseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvitationCourseAssignment_institutionId_idx" ON "public"."InvitationCourseAssignment"("institutionId");

-- CreateIndex
CREATE INDEX "InvitationCourseAssignment_courseId_idx" ON "public"."InvitationCourseAssignment"("courseId");

-- CreateIndex
CREATE INDEX "InvitationCourseAssignment_courseId_isChief_idx" ON "public"."InvitationCourseAssignment"("courseId", "isChief");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCourseAssignment_invitationId_courseId_key" ON "public"."InvitationCourseAssignment"("invitationId", "courseId");

-- CreateIndex
CREATE INDEX "AppUser_institutionId_role_idx" ON "public"."AppUser"("institutionId", "role");

-- CreateIndex
CREATE INDEX "AppUser_institutionId_courseId_idx" ON "public"."AppUser"("institutionId", "courseId");

-- CreateIndex
CREATE INDEX "AppUser_institutionId_isActive_idx" ON "public"."AppUser"("institutionId", "isActive");

-- CreateIndex
CREATE INDEX "Invitation_courseId_idx" ON "public"."Invitation"("courseId");

-- CreateIndex
CREATE INDEX "TeacherCourse_courseId_isChief_idx" ON "public"."TeacherCourse"("courseId", "isChief");

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvitationCourseAssignment" ADD CONSTRAINT "InvitationCourseAssignment_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "public"."Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvitationCourseAssignment" ADD CONSTRAINT "InvitationCourseAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvitationCourseAssignment" ADD CONSTRAINT "InvitationCourseAssignment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
