/*
  Warnings:

  - You are about to drop the column `flag_id` on the `rule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "rule" DROP CONSTRAINT "rule_flag_id_fkey";

-- AlterTable
ALTER TABLE "rule" DROP COLUMN "flag_id";

-- CreateTable
CREATE TABLE "_FeatureFlagToRule" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FeatureFlagToRule_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FeatureFlagToRule_B_index" ON "_FeatureFlagToRule"("B");

-- AddForeignKey
ALTER TABLE "_FeatureFlagToRule" ADD CONSTRAINT "_FeatureFlagToRule_A_fkey" FOREIGN KEY ("A") REFERENCES "feature_flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureFlagToRule" ADD CONSTRAINT "_FeatureFlagToRule_B_fkey" FOREIGN KEY ("B") REFERENCES "rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
