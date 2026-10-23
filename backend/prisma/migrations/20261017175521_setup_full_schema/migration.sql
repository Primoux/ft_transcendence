/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `registerDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('IN_PROGRESS', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('CLASSIC', 'HARDCORE', 'ARTWORK');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('LOW', 'HIGH', 'COMMON', 'UNCOMMON', 'RARE', 'MYTHIC', 'TIMESHIFTED');

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "password",
DROP COLUMN "registerDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Game";

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "GameStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "userId" TEXT NOT NULL,
    "dailyGameId" TEXT NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGame" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mode" "GameMode" NOT NULL DEFAULT 'CLASSIC',
    "targetCardId" TEXT NOT NULL,

    CONSTRAINT "DailyGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicCard" (
    "id" TEXT NOT NULL,
    "edhrecRank" INTEGER,
    "imageUrl" TEXT,
    "inPool" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "manaValue" INTEGER NOT NULL,
    "types" TEXT[],
    "supertypes" TEXT[],
    "subtypes" TEXT[],
    "colorIdentity" TEXT[],
    "power" TEXT,
    "toughness" TEXT,
    "extension" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,

    CONSTRAINT "MagicCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guess" (
    "id" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "guessedCardId" TEXT NOT NULL,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "dailyGameId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_userId_dailyGameId_key" ON "GameSession"("userId", "dailyGameId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyGame_date_mode_key" ON "DailyGame"("date", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "MagicCard_name_key" ON "MagicCard"("name");

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_dailyGameId_fkey" FOREIGN KEY ("dailyGameId") REFERENCES "DailyGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGame" ADD CONSTRAINT "DailyGame_targetCardId_fkey" FOREIGN KEY ("targetCardId") REFERENCES "MagicCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_guessedCardId_fkey" FOREIGN KEY ("guessedCardId") REFERENCES "MagicCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_dailyGameId_fkey" FOREIGN KEY ("dailyGameId") REFERENCES "DailyGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
