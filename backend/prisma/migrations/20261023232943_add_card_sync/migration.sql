/*
  Warnings:

  - The values [LOW,HIGH,TIMESHIFTED] on the enum `Rarity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rarity_new" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'MYTHIC', 'SPECIAL', 'BONUS');
ALTER TABLE "MagicCard" ALTER COLUMN "rarity" TYPE "Rarity_new" USING ("rarity"::text::"Rarity_new");
ALTER TYPE "Rarity" RENAME TO "Rarity_old";
ALTER TYPE "Rarity_new" RENAME TO "Rarity";
DROP TYPE "public"."Rarity_old";
COMMIT;

-- CreateTable
CREATE TABLE "CardSync" (
    "key" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardSync_pkey" PRIMARY KEY ("key")
);
