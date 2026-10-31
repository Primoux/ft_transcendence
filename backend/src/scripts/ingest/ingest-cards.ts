import { prisma } from "../../data/prisma";
import { SyncKey, syncRepository } from "../../data/repositories";
import { loadCards } from "./card-loader";
import {
  buildCardHistoriesMap,
  buildOracleCardsMap,
  readZippedStream,
} from "./scryfall-stream";
import { fetchBulkMetadata, fetchBulkStream } from "./scryfall-client";
import type { ScryfallBulkType } from "./scryfall-types";

try {
  console.log("Checking for card updates...");

  const oraclebulkType: ScryfallBulkType = "oracle_cards";
  const [oracleMetadata, defaultMetadata] = await Promise.all([
    fetchBulkMetadata(oraclebulkType),
    fetchBulkMetadata("default_cards"),
  ]);

  const syncKey: SyncKey = `scryfall_${oraclebulkType}`;
  const lastSync = await syncRepository.getLastSync(syncKey);

  if (lastSync && lastSync === oracleMetadata.updatedAt) {
    console.log("Cards are already up to date. Skipping ingestion.");
  } else {
    console.log(
      `New update found (${oracleMetadata.updatedAt}). Starting ingestion...`,
    );

    const [oracleStream, defaultStream] = await Promise.all([
      fetchBulkStream(oracleMetadata),
      fetchBulkStream(defaultMetadata),
    ]);

    const [oracleCardsMap, cardHistoriesMap] = await Promise.all([
      readZippedStream(oracleStream, buildOracleCardsMap, "oracle_cards"),
      readZippedStream(defaultStream, buildCardHistoriesMap, "default_cards"),
    ]);

    await loadCards(oracleCardsMap, cardHistoriesMap);

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
