-- CreateEnum
CREATE TYPE "ProtectionLevel" AS ENUM ('MINIMAL', 'BASIC', 'MAXIMUM', 'PARANOID');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "address" TEXT,
ADD COLUMN     "cableLengthAvg" DOUBLE PRECISION NOT NULL DEFAULT 15,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "clientPhone" TEXT,
ADD COLUMN     "installerName" TEXT,
ADD COLUMN     "protectionLevel" "ProtectionLevel" NOT NULL DEFAULT 'BASIC';
