/*
  Warnings:

  - Made the column `attribute` on table `feature_flag` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "feature_flag" ALTER COLUMN "attribute" SET NOT NULL;
