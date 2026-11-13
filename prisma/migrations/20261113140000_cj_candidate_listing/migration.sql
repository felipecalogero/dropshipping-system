-- AlterTable
ALTER TABLE "CjCandidate" ADD COLUMN "cjProductId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CjCandidate" ADD COLUMN "listedCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "CjCandidate_listedCount_idx" ON "CjCandidate"("listedCount");
