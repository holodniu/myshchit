-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PRO', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'ONCE', 'PRO');

-- CreateEnum
CREATE TYPE "NetworkType" AS ENUM ('SINGLE_PHASE', 'THREE_PHASE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'CALCULATED', 'EXPORTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ConsumerType" AS ENUM ('LIGHT', 'SOCKET', 'COOKTOP', 'OVEN', 'WATER_HEATER', 'ELECTRIC_BOILER', 'AIR_CONDITIONER', 'REFRIGERATOR', 'WASHING_MACHINE', 'EV_CHARGER', 'WARM_FLOOR', 'WORKSHOP', 'OUTDOOR', 'OTHER');

-- CreateEnum
CREATE TYPE "LineType" AS ENUM ('LIGHTING', 'SOCKETS', 'DEDICATED', 'MIXED');

-- CreateEnum
CREATE TYPE "PriceClass" AS ENUM ('BUDGET', 'MID', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Characteristic" AS ENUM ('B', 'C', 'D');

-- CreateEnum
CREATE TYPE "RcdType" AS ENUM ('AC', 'A', 'B', 'F');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ONCE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'CANCELED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "subscription" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "subscriptionUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "networkType" "NetworkType" NOT NULL DEFAULT 'SINGLE_PHASE',
    "totalPower" DOUBLE PRECISION,
    "calculatedPower" DOUBLE PRECISION,
    "inputCurrent" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumers" (
    "id" TEXT NOT NULL,
    "type" "ConsumerType" NOT NULL,
    "name" TEXT NOT NULL,
    "power" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "voltage" INTEGER NOT NULL DEFAULT 220,
    "powerFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "dedicatedLine" BOOLEAN NOT NULL DEFAULT false,
    "roomId" TEXT NOT NULL,
    "lineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Главный щит',
    "projectId" TEXT NOT NULL,
    "inputBreakerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "calculatedPower" DOUBLE PRECISION NOT NULL,
    "calculatedCurrent" DOUBLE PRECISION NOT NULL,
    "breakerId" TEXT,
    "rcdId" TEXT,
    "cableId" TEXT,
    "cableLength" DOUBLE PRECISION,
    "lineType" "LineType" NOT NULL DEFAULT 'MIXED',
    "panelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "description" TEXT,
    "priceClass" "PriceClass" NOT NULL DEFAULT 'MID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breakers" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sku" TEXT,
    "current" INTEGER NOT NULL,
    "characteristic" "Characteristic" NOT NULL,
    "poles" INTEGER NOT NULL DEFAULT 1,
    "breakingCapacity" INTEGER NOT NULL DEFAULT 6000,
    "priceRub" DOUBLE PRECISION,
    "datasheetUrl" TEXT,
    "shopUrls" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rcds" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sku" TEXT,
    "current" INTEGER NOT NULL,
    "sensitivity" INTEGER NOT NULL,
    "poles" INTEGER NOT NULL DEFAULT 2,
    "type" "RcdType" NOT NULL DEFAULT 'AC',
    "priceRub" DOUBLE PRECISION,
    "datasheetUrl" TEXT,
    "shopUrls" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rcds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cables" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "cores" INTEGER NOT NULL,
    "section" DOUBLE PRECISION NOT NULL,
    "maxCurrent" INTEGER NOT NULL,
    "insulation" TEXT,
    "pricePerMeter" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountRub" DOUBLE PRECISION NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "yookassaId" TEXT,
    "description" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "rooms_projectId_idx" ON "rooms"("projectId");

-- CreateIndex
CREATE INDEX "consumers_roomId_idx" ON "consumers"("roomId");

-- CreateIndex
CREATE INDEX "panels_projectId_idx" ON "panels"("projectId");

-- CreateIndex
CREATE INDEX "lines_panelId_idx" ON "lines"("panelId");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "breakers_sku_key" ON "breakers"("sku");

-- CreateIndex
CREATE INDEX "breakers_brandId_current_idx" ON "breakers"("brandId", "current");

-- CreateIndex
CREATE UNIQUE INDEX "rcds_sku_key" ON "rcds"("sku");

-- CreateIndex
CREATE INDEX "rcds_brandId_current_sensitivity_idx" ON "rcds"("brandId", "current", "sensitivity");

-- CreateIndex
CREATE INDEX "cables_section_cores_idx" ON "cables"("section", "cores");

-- CreateIndex
CREATE UNIQUE INDEX "payments_yookassaId_key" ON "payments"("yookassaId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumers" ADD CONSTRAINT "consumers_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumers" ADD CONSTRAINT "consumers_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panels" ADD CONSTRAINT "panels_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lines" ADD CONSTRAINT "lines_breakerId_fkey" FOREIGN KEY ("breakerId") REFERENCES "breakers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lines" ADD CONSTRAINT "lines_rcdId_fkey" FOREIGN KEY ("rcdId") REFERENCES "rcds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lines" ADD CONSTRAINT "lines_cableId_fkey" FOREIGN KEY ("cableId") REFERENCES "cables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lines" ADD CONSTRAINT "lines_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "panels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breakers" ADD CONSTRAINT "breakers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rcds" ADD CONSTRAINT "rcds_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cables" ADD CONSTRAINT "cables_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
