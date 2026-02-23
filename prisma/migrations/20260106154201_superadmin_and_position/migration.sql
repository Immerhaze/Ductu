/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `AppUser` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `AppUser` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `AppUser` table. All the data in the column will be lost.
  - You are about to drop the column `studentCode` on the `AppUser` table. All the data in the column will be lost.
  - You are about to drop the column `teacherCode` on the `AppUser` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `createdByAuthUserId` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `domainSlug` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndsAt` on the `Institution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `AppUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Institution_domainSlug_key";

-- AlterTable
ALTER TABLE "public"."AppUser" DROP COLUMN "avatarUrl",
DROP COLUMN "birthDate",
DROP COLUMN "jobTitle",
DROP COLUMN "studentCode",
DROP COLUMN "teacherCode",
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "positionTitle" TEXT;

-- AlterTable
ALTER TABLE "public"."Institution" DROP COLUMN "contactEmail",
DROP COLUMN "createdByAuthUserId",
DROP COLUMN "domainSlug",
DROP COLUMN "status",
DROP COLUMN "trialEndsAt";

-- AlterTable
ALTER TABLE "public"."Invitation" ADD COLUMN     "positionTitle" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "public"."AppUser"("email");
