/*
  Warnings:

  - You are about to drop the column `scenario_analysis` on the `valuations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."valuations" DROP COLUMN "scenario_analysis";

-- CreateTable
CREATE TABLE "public"."scenarios" (
    "id" TEXT NOT NULL,
    "valuation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "min_value" DOUBLE PRECISION NOT NULL,
    "max_value" DOUBLE PRECISION NOT NULL,
    "min_model_data" JSONB,
    "max_model_data" JSONB,
    "min_results_data" JSONB,
    "max_results_data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scenarios_valuation_id_idx" ON "public"."scenarios"("valuation_id");

-- CreateIndex
CREATE INDEX "scenarios_valuation_id_created_at_idx" ON "public"."scenarios"("valuation_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."scenarios" ADD CONSTRAINT "scenarios_valuation_id_fkey" FOREIGN KEY ("valuation_id") REFERENCES "public"."valuations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
