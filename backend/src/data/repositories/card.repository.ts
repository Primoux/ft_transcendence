import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const cardRepository = {
  async findAllPlayable(maxRank: number = 5000) {
    return prisma.magicCard.findMany({
      where: { edhrecRank: { lt: maxRank } },
    });
  },
  async findById(id: string) {
    return prisma.magicCard.findUnique({ where: { id } });
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
