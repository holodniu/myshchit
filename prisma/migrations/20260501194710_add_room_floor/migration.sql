-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "floor" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "rooms_projectId_floor_idx" ON "rooms"("projectId", "floor");
