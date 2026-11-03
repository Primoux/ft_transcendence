import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import type { ScryfallBulkType } from "./scryfall-types.ts";

export async function readZippedStream(
  rawStream: Readable,
  processor: (readable: Readable) => Promise<void>,
  bulkType: ScryfallBulkType,
): Promise<void> {
  console.log(`[${bulkType}] Decompressing stream and starting processing...`);

  const gz = createGunzip();

  await Promise.all([
    pipeline(rawStream, gz),
    processor(gz),
  ]);

  console.log(`[${bulkType}] Stream processing completed.`);
}
