-- CreateEnum
CREATE TYPE "operator" AS ENUM ('starts_with', 'ends_at', 'equal', 'not_equal', 'less_than', 'greater_than');

-- CreateEnum
CREATE TYPE "occupation" AS ENUM ('citizen', 'pirate', 'marine', 'bounty_hunter', 'admin');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "occupation" "occupation" NOT NULL DEFAULT 'citizen',
    "power_level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "feature_flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "operator" "operator" NOT NULL,
    "flag_id" INTEGER NOT NULL,

    CONSTRAINT "rule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
