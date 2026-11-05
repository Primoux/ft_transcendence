/*
  Warnings:

  - You are about to drop the column `extension` on the `MagicCard` table. All the data in the column will be lost.
  - The `colorIdentity` column on the `MagicCard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `releaseSetName` to the `MagicCard` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Color" AS ENUM ('WHITE', 'BLUE', 'BLACK', 'RED', 'GREEN', 'COLORLESS');

-- AlterTable
ALTER TABLE "MagicCard" DROP COLUMN "extension",
ADD COLUMN     "releaseSetName" TEXT NOT NULL,
DROP COLUMN "colorIdentity",
ADD COLUMN     "colorIdentity" "Color"[];
