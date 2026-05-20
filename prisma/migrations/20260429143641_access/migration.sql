-- CreateTable
CREATE TABLE "public"."AccessCode" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usedAt" TIMESTAMP(3),
    "usedByInstitutionId" UUID,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_code_key" ON "public"."AccessCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_usedByInstitutionId_key" ON "public"."AccessCode"("usedByInstitutionId");

-- CreateIndex
CREATE INDEX "AccessCode_isActive_idx" ON "public"."AccessCode"("isActive");

-- AddForeignKey
ALTER TABLE "public"."AccessCode" ADD CONSTRAINT "AccessCode_usedByInstitutionId_fkey" FOREIGN KEY ("usedByInstitutionId") REFERENCES "public"."Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
