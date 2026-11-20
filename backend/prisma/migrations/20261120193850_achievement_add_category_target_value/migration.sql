-- CreateEnum
CREATE TYPE "Category" AS ENUM ('WIN', 'GUESS', 'OTHER');

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "targetValue" INTEGER;
