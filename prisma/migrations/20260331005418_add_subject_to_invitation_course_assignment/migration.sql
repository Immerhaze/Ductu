-- AlterTable
ALTER TABLE "public"."InvitationCourseAssignment" ADD COLUMN     "subjectId" UUID;

-- CreateIndex
CREATE INDEX "InvitationCourseAssignment_subjectId_idx" ON "public"."InvitationCourseAssignment"("subjectId");

-- AddForeignKey
ALTER TABLE "public"."InvitationCourseAssignment" ADD CONSTRAINT "InvitationCourseAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
