/*
  Warnings:

  - You are about to drop the `CardSync` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CardSync";

-- CreateTable
CREATE TABLE "ScryfallSyncCard" (
    "key" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScryfallSyncCard_pkey" PRIMARY KEY ("key")
);
