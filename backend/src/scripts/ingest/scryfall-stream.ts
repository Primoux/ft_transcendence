import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { shouldKeepCard } from "./card-filter";
import type {
  ScryfallBulkType,
  ScryfallCardHistory,
  ScryfallOracleCard,
  ValidScryfallOracleCard,
} from "./scryfall-types";

export async function readZippedStream<T>(
  rawStream: Readable,
  processor: (readable: Readable) => Promise<T>,
  bulkType : ScryfallBulkType
): Promise<T> {
  console.log(`[${bulkType}] Decompressing and parsing stream...`);

  const gz = createGunzip();

  const [, result] = await Promise.all([
    pipeline(rawStream, gz),
    processor(gz),
  ]);

  console.log(`[${bulkType}] Stream parsing completed.`);
  
  return result;
}

export async function buildOracleCardsMap(
  decompressed: Readable,
): Promise<Map<string, ValidScryfallOracleCard>> {
  const rl = createInterface(decompressed);
  const oracleCardsMap = new Map<string, ValidScryfallOracleCard>();

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const card: ScryfallOracleCard = JSON.parse(line);
    if (!shouldKeepCard(card)) {
      continue;
    }

    oracleCardsMap.set(card.oracle_id, card);
  }

  return oracleCardsMap;
}

export async function buildCardHistoriesMap(
  decompressed: Readable,
): Promise<Map<string, ScryfallCardHistory>> {
  const rl = createInterface(decompressed);
  const cardHistoriesMap = new Map<string, ScryfallCardHistory>();

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const cardHistory: ScryfallCardHistory = JSON.parse(line);

    const value = cardHistoriesMap.get(cardHistory.oracle_id);
    if (value && value.released_at < cardHistory.released_at) {
      continue;
    }
    cardHistoriesMap.set(cardHistory.oracle_id, cardHistory);
  }

  return cardHistoriesMap;
}
