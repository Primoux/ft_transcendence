import type { Prisma } from "@prisma/client";
import { cardRepository } from "../../data/repositories";
import { toPrismaCard } from "./card-mapper";
import type {
  ScryfallCardHistory,
  ValidScryfallOracleCard,
} from "./scryfall-types";

export async function loadCards(
  oracleCardsMap: Map<string, ValidScryfallOracleCard>,
  cardHistoriesMap: Map<string, ScryfallCardHistory>,
): Promise<void> {
  let batch: Prisma.MagicCardCreateManyInput[] = [];

  for (const oracleId of oracleCardsMap.keys()) {
    const oracleCard = oracleCardsMap.get(oracleId);
    const cardHistory = cardHistoriesMap.get(oracleId);
    batch.push(toPrismaCard(oracleCard, cardHistory));

    if (batch.length >= BATCH_SIZE) {
      await cardRepository.upsertMany(batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await cardRepository.upsertMany(batch);
  }

  console.log(`${oldestCards.size} cards upserted.`);
}
