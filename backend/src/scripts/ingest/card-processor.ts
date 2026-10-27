import type { Prisma } from "@prisma/client";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { cardRepository } from "../../data/repositories";
import { shouldKeepCard } from "./card-filter";
import { toPrismaCard } from "./card-mapper";

const BATCH_SIZE = 500;

export async function processCardStream(rawStream: Readable): Promise<void> {
  console.log("Starting card stream processing...");

  const gz = createGunzip();

  await Promise.all([pipeline(rawStream, gz), processCardLines(gz)]);

  console.log("Card stream processing completed successfully.");
}

async function processCardLines(decompressed: Readable): Promise<void> {
  const rl = createInterface(decompressed);
  const oldestCards = new Map<string, any>();

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const card = JSON.parse(line);
    if (!shouldKeepCard(card)) {
      continue;
    }

    const key = card.name;
    const value = oldestCards.get(key);

    if (value && value.released_at < card.released_at) {
      continue;
    }
    oldestCards.set(card.name, card);
  }

  let batch: Prisma.MagicCardCreateManyInput[] = [];

  for (const card of oldestCards.values()) {
    batch.push(toPrismaCard(card));

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
