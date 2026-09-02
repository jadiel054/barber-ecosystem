-- AlterTable Barbershop for CNPJ & Extra Details
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "street" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "number" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "cnpj" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "corporateName" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "cnpjStatus" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "cnpjStatusDate" TIMESTAMP(3);
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "cnpjConsultedAt" TIMESTAMP(3);
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "cnpjSource" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN IF NOT EXISTS "cnae" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Barbershop_cnpj_key" ON "Barbershop"("cnpj");

-- CreateTable ContactMessage
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "barbershopId" TEXT,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable BroadcastCommunication
CREATE TABLE IF NOT EXISTS "BroadcastCommunication" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL DEFAULT 'ALL',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BroadcastCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable PlatformAnnouncement
CREATE TABLE IF NOT EXISTS "PlatformAnnouncement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BANNER',
    "couponCode" TEXT,
    "discountPercent" DOUBLE PRECISION,
    "targetAudience" TEXT NOT NULL DEFAULT 'ALL',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable FeatureToggle
CREATE TABLE IF NOT EXISTS "FeatureToggle" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureToggle_pkey" PRIMARY KEY ("key")
);

-- CreateTable FeatureToggleHistory
CREATE TABLE IF NOT EXISTS "FeatureToggleHistory" (
    "id" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "adminId" TEXT,
    "adminEmail" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureToggleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable PlatformSettings
CREATE TABLE IF NOT EXISTS "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "platformName" TEXT NOT NULL DEFAULT 'Central de Barbearias',
    "supportEmail" TEXT NOT NULL DEFAULT 'suporte@barberecosystem.com.br',
    "phone" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "footerTexts" JSONB,
    "pricingSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ContactMessage_barbershopId_fkey'
    ) THEN
        ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
