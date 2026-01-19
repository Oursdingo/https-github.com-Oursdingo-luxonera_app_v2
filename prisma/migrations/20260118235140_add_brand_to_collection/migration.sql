/*
  Warnings:

  - Added the required column `brandId` to the `Collection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "brandId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Collection_brandId_idx" ON "Collection"("brandId");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
