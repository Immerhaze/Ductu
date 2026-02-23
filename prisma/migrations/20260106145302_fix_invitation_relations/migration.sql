/*
  Warnings:

  - You are about to drop the column `documentId` on the `AppUser` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `AppUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AppUser" DROP CONSTRAINT "AppUser_institutionId_fkey";

-- DropIndex
DROP INDEX "public"."AppUser_institutionId_email_key";

-- AlterTable
ALTER TABLE "public"."AppUser" DROP COLUMN "documentId",
DROP COLUMN "phone",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "studentCode" TEXT,
ADD COLUMN     "teacherCode" TEXT,
ALTER COLUMN "institutionId" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "institutionId" UUID NOT NULL,
    "createdByAppUserId" UUID NOT NULL,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "public"."Invitation"("tokenHash");

-- AddForeignKey
ALTER TABLE "public"."AppUser" ADD CONSTRAINT "AppUser_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_createdByAppUserId_fkey" FOREIGN KEY ("createdByAppUserId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
