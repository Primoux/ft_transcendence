import type { Prisma } from "@prisma/client";
import { cardRepository, stagingRepository } from "../../data/repositories";
import { cardMapper } from "./scryfall-to-prisma-mapper";
import type {
  ScryfallCardHistory,
  ScryfallOracleCard,
  ValidScryfallOracleCard,
} from "./scryfall-types";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { shouldKeepCard } from "./card-filter";
import {sta} from

const BATCH_SIZE = 500;

export async function promoteCards(
  oracleCardsMap: Map<string, ValidScryfallOracleCard>,
  cardHistoriesMap: Map<string, ScryfallCardHistory>,
): Promise<void> {
  console.log(`Starting to load cards into the database...`);

  const batch: Prisma.MagicCardCreateManyInput[] = [];

  for (const [oracleId, oracleCard] of oracleCardsMap) {
    const cardHistory = cardHistoriesMap.get(oracleId)!;

    batch.push(toPrismaCard(oracleCard, cardHistory));

    if (batch.length >= BATCH_SIZE) {
      await cardRepository.upsertMany(batch);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    await cardRepository.upsertMany(batch);
  }

  console.log(`Successfully loaded ${oracleCardsMap.size} cards.`);
}

export async function stageOracleCards(
  decompressed: Readable,
): Promise<void> {
  const rl = createInterface(decompressed);
  const batch: Prisma.StagingOracleCardCreateManyInput[] = [];

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const card: ScryfallOracleCard = JSON.parse(line);
    if (!shouldKeepCard(card)) {
      continue;
    }

    batch.push(cardMapper.toStagingOracle(card));

    if (batch.length >= BATCH_SIZE) {
      await stagingRepository.createManyOracleCard(batch);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    await stagingRepository.createManyOracleCard(batch);
  }
}

export async function stageCardHistories(
  decompressed: Readable,
): Promise<void> {
  const rl = createInterface(decompressed);
  const batch: Prisma.StagingCardHistoryCreateManyInput[] = [];

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const cardHistory: ScryfallCardHistory = JSON.parse(line);

    batch.push(cardMapper.toStagingHistory(cardHistory));
    if (batch.length >= BATCH_SIZE) {
      await stagingRepository.createManyCardHistory(batch);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    await stagingRepository.createManyCardHistory(batch);
  }
}

