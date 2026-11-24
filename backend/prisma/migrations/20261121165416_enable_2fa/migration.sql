-- AlterEnum
ALTER TYPE "OtpType" ADD VALUE 'CAN_ENABLE_2FA';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorEnabledAt" TIMESTAMP(3);
