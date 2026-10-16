import { prisma } from "../prisma";

export const cardRepository = {
  async searchByName(query: string, limit = 5) {
    const searchFilter =
      query.length === 1
        ? { startsWith: query, mode: "insensitive" as const }
        : { contains: query, mode: "insensitive" as const };

    return await prisma.magicCard.findMany({
      where: { name: searchFilter },
      orderBy: { name: "asc" },
      take: limit,
    });
  },
};
