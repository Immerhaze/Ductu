-- CreateEnum
CREATE TYPE "public"."GradeCategory" AS ENUM ('EXAM', 'QUIZ', 'ASSIGNMENT', 'PROJECT', 'ORAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AnnotationType" AS ENUM ('POSITIVE', 'NEGATIVE', 'OBSERVATION');

-- AlterTable
ALTER TABLE "public"."Grade" ADD COLUMN     "category" "public"."GradeCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "comment" TEXT;

-- CreateTable
CREATE TABLE "public"."StudentAnnotation" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "courseId" UUID,
    "type" "public"."AnnotationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentAchievement" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentImprovementPlan" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "goal" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentImprovementPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAnnotation_institutionId_idx" ON "public"."StudentAnnotation"("institutionId");

-- CreateIndex
CREATE INDEX "StudentAnnotation_studentId_idx" ON "public"."StudentAnnotation"("studentId");

-- CreateIndex
CREATE INDEX "StudentAnnotation_authorId_idx" ON "public"."StudentAnnotation"("authorId");

-- CreateIndex
CREATE INDEX "StudentAnnotation_studentId_type_idx" ON "public"."StudentAnnotation"("studentId", "type");

-- CreateIndex
CREATE INDEX "StudentAchievement_institutionId_idx" ON "public"."StudentAchievement"("institutionId");

-- CreateIndex
CREATE INDEX "StudentAchievement_studentId_idx" ON "public"."StudentAchievement"("studentId");

-- CreateIndex
CREATE INDEX "StudentImprovementPlan_institutionId_idx" ON "public"."StudentImprovementPlan"("institutionId");

-- CreateIndex
CREATE INDEX "StudentImprovementPlan_studentId_idx" ON "public"."StudentImprovementPlan"("studentId");

-- CreateIndex
CREATE INDEX "StudentImprovementPlan_studentId_isCompleted_idx" ON "public"."StudentImprovementPlan"("studentId", "isCompleted");

-- AddForeignKey
ALTER TABLE "public"."StudentAnnotation" ADD CONSTRAINT "StudentAnnotation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentAnnotation" ADD CONSTRAINT "StudentAnnotation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentAnnotation" ADD CONSTRAINT "StudentAnnotation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentAnnotation" ADD CONSTRAINT "StudentAnnotation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentAchievement" ADD CONSTRAINT "StudentAchievement_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentAchievement" ADD CONSTRAINT "StudentAchievement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentAchievement" ADD CONSTRAINT "StudentAchievement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentImprovementPlan" ADD CONSTRAINT "StudentImprovementPlan_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentImprovementPlan" ADD CONSTRAINT "StudentImprovementPlan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentImprovementPlan" ADD CONSTRAINT "StudentImprovementPlan_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
