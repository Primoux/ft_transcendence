/*
  Warnings:

  - You are about to drop the column `inPool` on the `MagicCard` table. All the data in the column will be lost.
  - Added the required column `artUrl` to the `MagicCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseDate` to the `MagicCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseSet` to the `MagicCard` table without a default value. This is not possible if the table is not empty.
  - Made the column `imageUrl` on table `MagicCard` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MagicCard" DROP COLUMN "inPool",
ADD COLUMN     "artUrl" TEXT NOT NULL,
ADD COLUMN     "releaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "releaseSet" TEXT NOT NULL,
ALTER COLUMN "imageUrl" SET NOT NULL;
