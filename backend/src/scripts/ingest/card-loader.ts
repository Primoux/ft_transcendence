import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { stagingRepository } from "../../data/repositories";
import { isValidCardHistory, isValidOracleCard } from "./card-filter";
import { cardMapper } from "./scryfall-to-prisma-mapper";
import {
  SCRYFALL_BULK_TYPES,
  ScryfallBulkType,
  ScryfallCardHistory,
  ScryfallOracleCard,
} from "./scryfall-types";

const BATCH_SIZE = 500;

interface StagingOptions<TValid, TStaged> {
  bulkType: ScryfallBulkType;
  batchSize?: number;

  parseAndFilter: (line: string) => TValid | null;

  map: (item: TValid) => TStaged;
  stageBatch: (batch: TStaged[]) => Promise<{ count: number }>;
}

export async function processStream<TValid, TStaged>(
  decompressed: Readable,
  options: StagingOptions<TValid, TStaged>,
): Promise<void> {
  console.log(`[${options.bulkType}] Starting stream processing...`);

  const rl = createInterface(decompressed);
  const batchSize = options.batchSize ?? BATCH_SIZE;
  const batch: TStaged[] = [];

  let totalProcessed = 0;
  let totalStaged = 0;

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    totalProcessed++;

    const rawItem = options.parseAndFilter(line);
    if (!rawItem) {
      continue;
    }

    batch.push(options.map(rawItem));

    if (batch.length >= batchSize) {
      const result = await options.stageBatch(batch);
      totalStaged += result.count;
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    const result = await options.stageBatch(batch);
    totalStaged += result.count;
  }

  console.log(
    `[${options.bulkType}] Finished! ${totalStaged} items loaded out of ${totalProcessed} processed.`,
  );
}

export async function stageOracleCards(decompressed: Readable): Promise<void> {
  return await processStream(decompressed, {
    bulkType: SCRYFALL_BULK_TYPES.ORACLE,
    parseAndFilter: (line) => {
      const card: ScryfallOracleCard = JSON.parse(line);
      return isValidOracleCard(card) ? card : null;
    },
    map: cardMapper.toStagingOracle,
    stageBatch: stagingRepository.createManyOracleCard,
  });
}

export async function stageCardHistories(
  decompressed: Readable,
): Promise<void> {
  return await processStream(decompressed, {
    bulkType: SCRYFALL_BULK_TYPES.DEFAULT,
    parseAndFilter: (line) => {
      const cardHistory: ScryfallCardHistory = JSON.parse(line);
      return isValidCardHistory(cardHistory) ? cardHistory : null;
    },
    map: cardMapper.toStagingHistory,
    stageBatch: stagingRepository.createManyCardHistory
  });
}
