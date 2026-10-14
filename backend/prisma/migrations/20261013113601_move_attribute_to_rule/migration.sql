/*
  Warnings:

  - You are about to drop the column `attribute` on the `feature_flag` table. All the data in the column will be lost.
  - Added the required column `attribute` to the `rule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feature_flag" DROP COLUMN "attribute";

-- AlterTable
ALTER TABLE "rule" ADD COLUMN     "attribute" "user_attribute" NOT NULL;
