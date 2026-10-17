/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `feature_flag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "feature_flag_name_key" ON "feature_flag"("name");
