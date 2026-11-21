import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";

export async function readZippedStream(
  rawStream: Readable,
  processor: (readable: Readable) => Promise<void>,
  label: string,
): Promise<void> {
  console.log(`[${label}] Decompressing stream and starting processing...`);

  const gz = createGunzip();

  await Promise.all([
    pipeline(rawStream, gz),
    processor(gz),
  ]);

  console.log(`[${label}] Stream processing completed.`);
}
