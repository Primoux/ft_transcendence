import { prisma } from "../data/prisma";
import { SyncKey, syncRepository } from "../data/repositories";
import { processCardStream } from "./card-processor";
import {
  fetchBulkMetadata,
  fetchBulkStream,
  type ScryfallBulkType,
} from "./scryfall-client";

try {
  console.log("Checking for card updates...");

  const bulkType: ScryfallBulkType = "default_cards";
  const metadata = await fetchBulkMetadata(bulkType);

  const syncKey: SyncKey = `scryfall_${bulkType}`;
  const lastSync = await syncRepository.getLastSync(syncKey);

  if (lastSync && lastSync.getDate() === metadata.updatedAt.getDate()) {
    console.log("Cards are already up to date. Skipping ingestion.");
  } else {
    console.log(
      `New update found (${metadata.updatedAt}). Starting ingestion...`,
    );

    const stream = await fetchBulkStream(metadata.downloadUri);
    await processCardStream(stream);

    await syncRepository.saveLastSync(syncKey, metadata.updatedAt);

    console.log("Card ingestion completed successfully.");
  }
} catch (error) {
  console.error("Fatal ingestion error:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  console.log("Prisma connection closed.");
}
