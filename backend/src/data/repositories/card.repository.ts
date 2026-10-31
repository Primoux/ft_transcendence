import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const cardRepository = {
  async searchByName(query: string, limit = 5) {
    const searchFilter =
      query.length === 1
        ? { startsWith: query, mode: "insensitive" as const }
        : { contains: query, mode: "insensitive" as const };

    return prisma.magicCard.findMany({
      where: { name: searchFilter },
      orderBy: { name: "asc" },
      take: limit,
    });
  },

  async upsertMany(cards: Prisma.MagicCardCreateManyInput[]) {
    const operations = cards.map((card) => {
      const { oracleId, ...updateFields } = card;
      return prisma.magicCard.upsert({
        where: { oracleId },
        update: updateFields,
        create: card,
      });
    });

    return prisma.$transaction(operations);
  },

  async insertFromStaging() : Promise<number> {
    return prisma.$executeRaw`
    WITH OldestCardHistory AS (
      SELECT
        "oracleId",
        "releaseDate",
        "releaseSet",
        "releaseSetName",
        ROW_NUMBER() OVER (PARTITION BY "oracleId" ORDER BY "releaseDate" ASC) as rn
      FROM "StagingCardHistory"
    )
    INSERT INTO "MagicCard" (
      "oracleId",
      "edhrecRank",
      "imageUrl",
      "artUrl",
      "name",
      "manaValue",
      "types",
      "supertypes",
      "subtypes",
      "colorIdentity",
      "power",
      "toughness",
      "rarity",
      "releaseDate",
      "releaseSet",
      "releaseSetName"
    )
    SELECT
      soc."oracleId",
      soc."edhrecRank",
      soc."imageUrl",
      soc."artUrl",
      soc."name",
      soc."manaValue",
      soc.types,
      soc.supertypes,
      soc.subtypes,
      soc."colorIdentity",
      soc.power,
      soc.toughness,
      soc.rarity,
      och."releaseDate",
      och."releaseSet",
      och."releaseSetName"
    FROM "StagingOracleCard" soc
    JOIN OldestCardHistory och ON soc."oracleId" = och."oracleId" AND och.rn = 1;
    ON CONFLICT ("oracleId") DO UPDATE SET
      "edhrecRank" = EXCLUDED."edhrecRank",
      "imageUrl" = EXCLUDED."imageUrl",
      "artUrl" = EXCLUDED."artUrl",
      "name" = EXCLUDED."name",
      "manaValue" = EXCLUDED."manaValue",
      "types" = EXCLUDED."types",
      "supertypes" = EXCLUDED."supertypes",
      "subtypes" = EXCLUDED."subtypes",
      "colorIdentity" = EXCLUDED."colorIdentity",
      "power" = EXCLUDED."power",
      "toughness" = EXCLUDED."toughness",
      "rarity" = EXCLUDED."rarity",
      "releaseDate" = EXCLUDED."releaseDate",
      "releaseSet" = EXCLUDED."releaseSet",
      "releaseSetName" = EXCLUDED."releaseSetName";
    `;
  },
};
