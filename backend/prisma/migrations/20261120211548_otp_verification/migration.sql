/*
  Warnings:

  - You are about to drop the `EmailVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoginChallenge` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL_IS_VALID', 'CAN_LOGIN', 'CAN_DELETE_ACCOUNT', 'CAN_REQUEST_DATA', 'CAN_DISABLE_2FA', 'CAN_CHANGE_EMAIL');

-- DropForeignKey
ALTER TABLE "EmailVerification" DROP CONSTRAINT "EmailVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "LoginChallenge" DROP CONSTRAINT "LoginChallenge_userId_fkey";

-- DropTable
DROP TABLE "EmailVerification";

-- DropTable
DROP TABLE "LoginChallenge";

-- CreateTable
CREATE TABLE "OtpVerification" (
    "loginTokenHash" TEXT,
    "type" "OtpType" NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("type","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_loginTokenHash_key" ON "OtpVerification"("loginTokenHash");

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
