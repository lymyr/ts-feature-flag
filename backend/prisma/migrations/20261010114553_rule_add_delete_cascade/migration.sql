-- DropForeignKey
ALTER TABLE "rule" DROP CONSTRAINT "rule_flagId_fkey";

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "feature_flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
