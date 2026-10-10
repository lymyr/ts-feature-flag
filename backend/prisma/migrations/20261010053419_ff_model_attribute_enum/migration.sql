/*
  Warnings:

  - The `attribute` column on the `feature_flag` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "user_attribute" AS ENUM ('id', 'username', 'occupation', 'power_level');

-- AlterTable
ALTER TABLE "feature_flag" DROP COLUMN "attribute",
ADD COLUMN     "attribute" "user_attribute";
