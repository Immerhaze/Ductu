/*
  Warnings:

  - You are about to drop the column `slug` on the `Institution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authUserId]` on the table `AppUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `AppUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Institution` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."AppUser_authUserId_idx";

-- DropIndex
DROP INDEX "public"."AppUser_email_idx";

-- DropIndex
DROP INDEX "public"."AppUser_institutionId_authUserId_key";

-- DropIndex
DROP INDEX "public"."AppUser_institutionId_email_key";

-- DropIndex
DROP INDEX "public"."AppUser_institutionId_role_idx";

-- DropIndex
DROP INDEX "public"."Institution_slug_key";

-- AlterTable
ALTER TABLE "public"."Institution" DROP COLUMN "slug";

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_authUserId_key" ON "public"."AppUser"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "public"."AppUser"("email");

-- CreateIndex
CREATE INDEX "AppUser_institutionId_idx" ON "public"."AppUser"("institutionId");

-- CreateIndex
CREATE INDEX "AppUser_role_idx" ON "public"."AppUser"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "public"."Institution"("name");
