/*
  Warnings:

  - A unique constraint covering the columns `[gameSessionId,attemptNumber]` on the table `Guess` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameSessionId,guessedCardId]` on the table `Guess` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GameSession" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Guess_gameSessionId_attemptNumber_key" ON "Guess"("gameSessionId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Guess_gameSessionId_guessedCardId_key" ON "Guess"("gameSessionId", "guessedCardId");
