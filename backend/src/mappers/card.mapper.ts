import type { Prisma } from "@prisma/client";

export function toPrismaCard(
  scryfallCard: any,
): Prisma.MagicCardCreateManyInput {
  return {
    name: scryfallCard.name,
    manaValue: scryfallCard.cmc ?? 0,
    extension: scryfallCard.set,
    colorIdentity: scryfallCard.color_identity ?? [],
    power: scryfallCard.power ?? null,
    toughness: scryfallCard.toughness ?? null,
    edhrecRank: scryfallCard.edhrec_rank ?? null,
  };
}
