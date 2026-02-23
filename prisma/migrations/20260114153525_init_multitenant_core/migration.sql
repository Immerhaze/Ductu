/*
  Warnings:

  - A unique constraint covering the columns `[institutionId,email]` on the table `AppUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[institutionId,authUserId]` on the table `AppUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Institution` will be added. If there are existing duplicate values, this will fail.
  - Made the column `authUserId` on table `AppUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `institutionId` on table `AppUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `AppUser` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `slug` to the `Institution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AppUser" DROP CONSTRAINT "AppUser_institutionId_fkey";

-- DropIndex
DROP INDEX "public"."AppUser_authUserId_key";

-- DropIndex
DROP INDEX "public"."AppUser_email_key";

-- AlterTable
ALTER TABLE "public"."AppUser" ALTER COLUMN "authUserId" SET NOT NULL,
ALTER COLUMN "institutionId" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Institution" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "public"."InstitutionStatus" NOT NULL DEFAULT 'draft';

-- CreateIndex
CREATE INDEX "AppUser_authUserId_idx" ON "public"."AppUser"("authUserId");

-- CreateIndex
CREATE INDEX "AppUser_email_idx" ON "public"."AppUser"("email");

-- CreateIndex
CREATE INDEX "AppUser_institutionId_role_idx" ON "public"."AppUser"("institutionId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_institutionId_email_key" ON "public"."AppUser"("institutionId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_institutionId_authUserId_key" ON "public"."AppUser"("institutionId", "authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_slug_key" ON "public"."Institution"("slug");

-- CreateIndex
CREATE INDEX "Institution_status_idx" ON "public"."Institution"("status");

-- CreateIndex
CREATE INDEX "Invitation_institutionId_idx" ON "public"."Invitation"("institutionId");

-- CreateIndex
CREATE INDEX "Invitation_institutionId_email_idx" ON "public"."Invitation"("institutionId", "email");

-- CreateIndex
CREATE INDEX "Invitation_expiresAt_idx" ON "public"."Invitation"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."AppUser" ADD CONSTRAINT "AppUser_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
