-- AlterTable
ALTER TABLE "valuations" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "valuations_share_token_key" ON "valuations"("share_token");

-- CreateIndex
CREATE INDEX "valuations_share_token_idx" ON "valuations"("share_token");

