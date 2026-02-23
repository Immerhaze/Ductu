-- CreateEnum
CREATE TYPE "public"."PostTargetType" AS ENUM ('ALL', 'ROLE', 'COURSE');

-- AlterTable
ALTER TABLE "public"."AppUser" ADD COLUMN     "courseId" UUID;

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attachmentId" UUID,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostTarget" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "type" "public"."PostTargetType" NOT NULL,
    "role" "public"."UserRole",
    "courseId" UUID,

    CONSTRAINT "PostTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Course_institutionId_idx" ON "public"."Course"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_institutionId_name_key" ON "public"."Course"("institutionId", "name");

-- CreateIndex
CREATE INDEX "Post_institutionId_createdAt_idx" ON "public"."Post"("institutionId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_authorId_createdAt_idx" ON "public"."Post"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "PostTarget_postId_idx" ON "public"."PostTarget"("postId");

-- CreateIndex
CREATE INDEX "PostTarget_type_role_idx" ON "public"."PostTarget"("type", "role");

-- CreateIndex
CREATE INDEX "PostTarget_type_courseId_idx" ON "public"."PostTarget"("type", "courseId");

-- CreateIndex
CREATE INDEX "AppUser_courseId_idx" ON "public"."AppUser"("courseId");

-- AddForeignKey
ALTER TABLE "public"."AppUser" ADD CONSTRAINT "AppUser_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "public"."Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostTarget" ADD CONSTRAINT "PostTarget_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostTarget" ADD CONSTRAINT "PostTarget_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
