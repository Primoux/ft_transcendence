import type { Prisma } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

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
      const { id, ...updateFields } = card;
      return prisma.magicCard.upsert({
        where: { id },
        update: updateFields,
        create: card,
      });
    });

    return prisma.$transaction(operations);
  },
};
