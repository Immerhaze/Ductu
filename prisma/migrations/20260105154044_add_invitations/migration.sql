/*
  Warnings:

  - A unique constraint covering the columns `[institutionId,email]` on the table `AppUser` will be added. If there are existing duplicate values, this will fail.
  - Made the column `institutionId` on table `AppUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `AppUser` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."AppUser" DROP CONSTRAINT "AppUser_institutionId_fkey";

-- AlterTable
ALTER TABLE "public"."AppUser" ADD COLUMN     "documentId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileCompletedAt" TIMESTAMP(3),
ALTER COLUMN "institutionId" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_institutionId_email_key" ON "public"."AppUser"("institutionId", "email");

-- AddForeignKey
ALTER TABLE "public"."AppUser" ADD CONSTRAINT "AppUser_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
