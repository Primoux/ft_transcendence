import type { Prisma } from "@prisma/client";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { cardRepository } from "../data/repositories";
import { shouldKeepCard, toPrismaCard } from "../mappers/card.mapper";

const BATCH_SIZE = 500;

export async function processCardStream(rawStream: Readable) {
  console.log("Starting card stream processing...");

  const gz = createGunzip();

  await Promise.all([pipeline(rawStream, gz), processCardLines(gz)]);

  console.log("Card stream processing completed successfully.");
}

async function processCardLines(decompressed: Readable) {
  const rl = createInterface(decompressed);
  let counter = 0;
  let batch: Prisma.MagicCardCreateManyInput[] = [];

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const card = JSON.parse(line);
    if (!shouldKeepCard(card)) {
      continue;
    }

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
