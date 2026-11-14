-- AlterTable
ALTER TABLE "User" DROP COLUMN "displayName",
ADD COLUMN     "avatarKey" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Usernames are now compared lowercased. Lowercase existing ones, except where two would collide
-- (those users keep their name and must be renamed by hand).
UPDATE "User" u SET "username" = lower(u."username")
WHERE u."username" <> lower(u."username")
  AND NOT EXISTS (SELECT 1 FROM "User" o WHERE o."id" <> u."id" AND o."username" = lower(u."username"));
