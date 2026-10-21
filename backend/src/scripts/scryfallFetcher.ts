import type { Prisma } from "../../generated/client.ts";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { cardRepository } from "../data/repositories";

const userAgent = "42Lyon-ARA-MTGDle/0.1";
const accept = "application/json;q=0.9,*/*;q=0.8";
const httpHeaders = { "User-Agent": userAgent, Accept: accept };

const BATCH_SIZE = 500;

interface ScryfallBulkFile {
  type: string;
  jsonl_download_uri: string;
}

interface ScryfallResponse {
  data: ScryfallBulkFile[];
}

async function getOracleCardsUri() {
  console.log("Getting oracle_cards file uri");
  const response = await fetch("https://api.scryfall.com/bulk-data", {
    headers: httpHeaders,
  });
  if (!response.ok)
    throw new Error(`Scryfall returned an error : ${response.status}`);
  const items: ScryfallResponse = await response.json();

  const oracleCardsObject = items.data.find(
    (item) => item.type === "oracle_cards",
  );
  if (oracleCardsObject === undefined)
    throw new Error("no Oracle Cards file available");

  return oracleCardsObject.jsonl_download_uri;
}

async function getOracleCards(downloadUri: string) {
  console.log("fetching oracle_cards file");
  const response = await fetch(downloadUri, { headers: httpHeaders });
  if (!response.ok)
    throw new Error(`Scryfall returned an error : ${response.status}`);
  if (!response.body)
    throw new Error(
      `Scryfall returned empty response. Status : ${response.status}`,
    );

  const readableResponse = Readable.fromWeb(
    response.body as import("node:stream/web").ReadableStream,
  );

  const gz = createGunzip();

  await Promise.all([pipeline(readableResponse, gz), collectCards(gz)]);
}

async function collectCards(decompressed: Readable) {
  const rl = createInterface(decompressed);
  let counter = 0;
  let batch: Prisma.MagicCardCreateManyInput[] = [];

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const card = JSON.parse(line);

    batch.push(card);
    counter++;

    if (batch.length >= BATCH_SIZE) {
      await cardRepository.upsertMany(batch);
      batch = [];
    }
  }

  if (batch.length != 0) {
    await cardRepository.upsertMany(batch);
  }

  console.log(`${counter} cards upserted`);
}

const uri = await getOracleCardsUri();
await getOracleCards(uri);
