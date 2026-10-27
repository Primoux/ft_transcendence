import { Readable } from "node:stream";

const USER_AGENT = "42Lyon-ARA-MTGDle/0.1";
const HTTP_ACCEPT = "application/json;q=0.9,*/*;q=0.8";
const HTTP_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: HTTP_ACCEPT,
} as const;

const SCRYFALL_BULK_DATA_URL = "https://api.scryfall.com/bulk-data";
const DEFAULT_BULK_TYPE = "default_cards";

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

export type ScryfallBulkType =
  | "default_cards"
  | "all_cards"
  | "unique_artwork"
  | "oracle_cards"
  | "oracle_tags"
  | "rulings"
  | "art_tags";

export async function fetchBulkMetadata(
  bulkType: ScryfallBulkType = DEFAULT_BULK_TYPE,
): Promise<BulkMetadata> {
  console.log(`Fetching bulk metadata for type: ${bulkType}`);

  const response = await fetch(SCRYFALL_BULK_DATA_URL, {
    headers: HTTP_HEADERS,
  });
  if (!response.ok)
    throw new Error(`Scryfall returned an error : ${response.status}`);

  const bulkList: ScryfallResponse = await response.json();

  const targetBulk = bulkList.data.find((item) => item.type === bulkType);
  if (!targetBulk)
    throw new Error(`No bulk file available for type: ${bulkType}`);

  return {
    type: targetBulk.type,
    downloadUri: targetBulk.jsonl_download_uri,
    updatedAt: new Date(targetBulk.updated_at),
  };
}

export async function fetchBulkStream(downloadUri: string): Promise<Readable> {
  console.log("Fetching raw card bulk stream...");
  const response = await fetch(downloadUri, { headers: HTTP_HEADERS });

  if (!response.ok) {
    throw new Error(`Scryfall returned an error: ${response.status}`);
  }
  if (!response.body) {
    throw new Error(
      `Scryfall returned an empty response body. Status: ${response.status}`,
    );
  }

  return Readable.fromWeb(
    response.body as import("node:stream/web").ReadableStream,
  );
}
