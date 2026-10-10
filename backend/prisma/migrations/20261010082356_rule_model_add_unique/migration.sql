/*
  Warnings:

  - You are about to drop the `_FeatureFlagToRule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[value,flagId,operator]` on the table `rule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `flagId` to the `rule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_FeatureFlagToRule" DROP CONSTRAINT "_FeatureFlagToRule_A_fkey";

-- DropForeignKey
ALTER TABLE "_FeatureFlagToRule" DROP CONSTRAINT "_FeatureFlagToRule_B_fkey";

-- AlterTable
ALTER TABLE "rule" ADD COLUMN     "flagId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_FeatureFlagToRule";

-- CreateIndex
CREATE UNIQUE INDEX "rule_value_flagId_operator_key" ON "rule"("value", "flagId", "operator");

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "feature_flag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
