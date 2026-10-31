import { Readable } from "node:stream";
import type { ScryfallBulkType } from "./scryfall-types";

const USER_AGENT = "42Lyon-ARA-MTGDle/0.1";
const HTTP_ACCEPT = "application/json;q=0.9,*/*;q=0.8";
const HTTP_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: HTTP_ACCEPT,
} as const;

const SCRYFALL_BULK_DATA_URL = "https://api.scryfall.com/bulk-data";

interface ScryfallResponse {
  data: ScryfallBulkRaw[];
}

interface ScryfallBulkRaw {
  type: string;
  jsonl_download_uri: string;
  updated_at: string;
}

interface BulkMetadata {
  type: string;
  downloadUri: string;
  updatedAt: Date;
}

export async function fetchBulkMetadata(
  bulkType: ScryfallBulkType,
): Promise<BulkMetadata> {
  console.log(`[${bulkType}] Fetching bulk metadata...`);

  const response = await fetch(SCRYFALL_BULK_DATA_URL, {
    headers: HTTP_HEADERS,
  });
  if (!response.ok)
    throw new Error(`Scryfall returned an error : ${response.status}`);

  const bulkList: ScryfallResponse = await response.json();

  const targetBulk = bulkList.data.find((item) => item.type === bulkType);
  if (!targetBulk)
    throw new Error(`[${bulkType}] No bulk file available for type: ${bulkType}`);

  console.log(`[${bulkType}] Metadata fetched successfully.`);

  return {
    type: targetBulk.type,
    downloadUri: targetBulk.jsonl_download_uri,
    updatedAt: new Date(targetBulk.updated_at),
  };
}

export async function fetchBulkStream(metadata: BulkMetadata): Promise<Readable> {
  console.log(`[${metadata.type}] Fetching compressed stream...`);

  const response = await fetch(metadata.downloadUri, { headers: HTTP_HEADERS });

  if (!response.ok) {
    throw new Error(`[${metadata.type}] Scryfall returned an error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error(
      `[${metadata.type}] Scryfall returned an empty response body. Status: ${response.status}`,
    );
  }

  console.log(`[${metadata.type}] Compressed stream fetched successfully.`);

  return Readable.fromWeb(
    response.body as import("node:stream/web").ReadableStream,
  );
}
