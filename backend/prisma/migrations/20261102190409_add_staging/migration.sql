/*
  Warnings:

  - The primary key for the `MagicCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MagicCard` table. All the data in the column will be lost.
  - Added the required column `oracleId` to the `MagicCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DailyGame" DROP CONSTRAINT "DailyGame_targetCardId_fkey";

-- DropForeignKey
ALTER TABLE "Guess" DROP CONSTRAINT "Guess_guessedCardId_fkey";

-- DropIndex
DROP INDEX "MagicCard_name_key";

-- AlterTable
ALTER TABLE "MagicCard" DROP CONSTRAINT "MagicCard_pkey",
DROP COLUMN "id",
ADD COLUMN     "oracleId" TEXT NOT NULL,
ADD CONSTRAINT "MagicCard_pkey" PRIMARY KEY ("oracleId");

-- CreateTable
CREATE TABLE "StagingOracleCard" (
    "oracleId" TEXT NOT NULL,
    "edhrecRank" INTEGER,
    "imageUrl" TEXT NOT NULL,
    "artUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manaValue" INTEGER NOT NULL,
    "types" TEXT[],
    "supertypes" TEXT[],
    "subtypes" TEXT[],
    "colorIdentity" "Color"[],
    "power" TEXT,
    "toughness" TEXT,
    "rarity" "Rarity" NOT NULL,

    CONSTRAINT "StagingOracleCard_pkey" PRIMARY KEY ("oracleId")
);

-- CreateTable
CREATE TABLE "StagingCardHistory" (
    "id" TEXT NOT NULL,
    "oracleId" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "releaseSet" TEXT NOT NULL,
    "releaseSetName" TEXT NOT NULL,

    CONSTRAINT "StagingCardHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyGame" ADD CONSTRAINT "DailyGame_targetCardId_fkey" FOREIGN KEY ("targetCardId") REFERENCES "MagicCard"("oracleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_guessedCardId_fkey" FOREIGN KEY ("guessedCardId") REFERENCES "MagicCard"("oracleId") ON DELETE RESTRICT ON UPDATE CASCADE;
