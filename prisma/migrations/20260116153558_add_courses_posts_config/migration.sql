/*
  Warnings:

  - A unique constraint covering the columns `[institutionId,levelCode,section]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `levelCode` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelNumber` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelType` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AcademicLevelType" AS ENUM ('BASIC', 'MIDDLE');

-- CreateEnum
CREATE TYPE "public"."SectionNaming" AS ENUM ('LETTERS', 'NUMBERS');

-- CreateEnum
CREATE TYPE "public"."CourseNameFormat" AS ENUM ('CHILE_TRADITIONAL', 'COMPACT', 'HUNDREDS');

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "levelCode" TEXT NOT NULL,
ADD COLUMN     "levelNumber" INTEGER NOT NULL,
ADD COLUMN     "levelType" "public"."AcademicLevelType" NOT NULL,
ADD COLUMN     "section" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."InstitutionCourseConfig" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "activeLevels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sectionNaming" "public"."SectionNaming" NOT NULL DEFAULT 'LETTERS',
    "sectionCount" INTEGER NOT NULL DEFAULT 2,
    "nameFormat" "public"."CourseNameFormat" NOT NULL DEFAULT 'CHILE_TRADITIONAL',
    "hundredsBase" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionCourseConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionCourseConfig_institutionId_key" ON "public"."InstitutionCourseConfig"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionCourseConfig_institutionId_idx" ON "public"."InstitutionCourseConfig"("institutionId");

-- CreateIndex
CREATE INDEX "Course_institutionId_isActive_idx" ON "public"."Course"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Course_institutionId_levelCode_section_key" ON "public"."Course"("institutionId", "levelCode", "section");

-- AddForeignKey
ALTER TABLE "public"."InstitutionCourseConfig" ADD CONSTRAINT "InstitutionCourseConfig_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
