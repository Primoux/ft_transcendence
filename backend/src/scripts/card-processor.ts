import type { Prisma } from "../../generated/client.ts";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { cardRepository } from "../data/repositories/index.ts";
import { shouldKeepCard, toPrismaCard } from "../mappers/card.mapper.ts";

const BATCH_SIZE = 500;

export async function processCardStream(rawStream: Readable): Promise<void> {
  console.log("Starting card stream processing...");

  const gz = createGunzip();

  await Promise.all([pipeline(rawStream, gz), processCardLines(gz)]);

  console.log("Card stream processing completed successfully.");
}

async function processCardLines(decompressed: Readable): Promise<void> {
  const rl = createInterface(decompressed);
  let counter = 0;
  let batch: Prisma.MagicCardCreateManyInput[] = [];

  const cardNames = new Set<string>();
  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const card = JSON.parse(line);
    if (!shouldKeepCard(card)) {
      continue;
    }

    if (cardNames.has(card.name)) {
      continue;
    }
    cardNames.add(card.name);

    batch.push(toPrismaCard(card));
    counter++;

    if (batch.length >= BATCH_SIZE) {
      await cardRepository.upsertMany(batch);
      batch = [];
    }
  }

  if (batch.length !== 0) {
    await cardRepository.upsertMany(batch);
  }

  console.log(`${counter} cards upserted.`);
}
