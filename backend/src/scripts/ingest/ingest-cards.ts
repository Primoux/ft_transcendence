import { prisma } from "../../data/prisma";
import { SyncKey, syncRepository } from "../../data/repositories";
import {
  buildCardHistoriesMap,
  buildOracleCardsMap,
  readZippedStream,
} from "./card-parser";
import {
  fetchBulkMetadata,
  fetchBulkStream,
  type ScryfallBulkType,
} from "./scryfall-client";

try {
  console.log("Checking for card updates...");

  const oraclebulkType: ScryfallBulkType = "oracle_cards";
  const [oracleMetadata, defaultMetadata] = await Promise.all([
    fetchBulkMetadata(oraclebulkType),
    fetchBulkMetadata("default_cards"),
  ]);

  const syncKey: SyncKey = `scryfall_${oraclebulkType}`;
  const lastSync = await syncRepository.getLastSync(syncKey);

  if (lastSync && lastSync.getDate() === oracleMetadata.updatedAt.getDate()) {
    console.log("Cards are already up to date. Skipping ingestion.");
  } else {
    console.log(
      `New update found (${oracleMetadata.updatedAt}). Starting ingestion...`,
    );

    const [oracleStream, defaultStream] = await Promise.all([
      fetchBulkStream(oracleMetadata.downloadUri),
      fetchBulkStream(defaultMetadata.downloadUri),
    ]);

    const [oracleCardsMap, cardHistoriesMap] = await Promise.all([
      readZippedStream(oracleStream, buildOracleCardsMap),
      readZippedStream(defaultStream, buildCardHistoriesMap),
    ]);

    await processCardStream(oracleStream);

    await syncRepository.saveLastSync(syncKey, oracleMetadata.updatedAt);

    console.log("Card ingestion completed successfully.");
  }
} catch (error) {
  console.error("Fatal ingestion error:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  console.log("Prisma connection closed.");
}
