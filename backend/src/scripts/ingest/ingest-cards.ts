import { prisma } from "../../data/prisma";
import {
  cardRepository,
  stagingRepository,
  SyncKey,
  syncRepository,
} from "../../data/repositories/index.ts";
import { stageCardHistories, stageOracleCards } from "./card-loader.ts";
import { fetchBulkMetadata, fetchBulkStream } from "./scryfall-client.ts";
import { readZippedStream } from "./scryfall-stream.ts";
import { SCRYFALL_BULK_TYPES } from "./scryfall-types.ts";

try {
  console.log("Checking for card updates...");

  const startTime = performance.now();

  const [oracleMetadata, defaultMetadata] = await Promise.all([
    fetchBulkMetadata(SCRYFALL_BULK_TYPES.ORACLE),
    fetchBulkMetadata(SCRYFALL_BULK_TYPES.DEFAULT),
  ]);

  const oracleSyncKey: SyncKey = `scryfall_${SCRYFALL_BULK_TYPES.ORACLE}`;
  const defaultSyncKey: SyncKey = `scryfall_${SCRYFALL_BULK_TYPES.DEFAULT}`;

  const [lastOracleSync, lastDefaultSync] = await Promise.all([
    await syncRepository.getLastSync(oracleSyncKey),
    await syncRepository.getLastSync(defaultSyncKey),
  ]);

  const isOracleNew =
    !lastOracleSync ||
    lastOracleSync.getTime() !== oracleMetadata.updatedAt.getTime();
  const isDefaultNew =
    !lastDefaultSync ||
    lastDefaultSync.getTime() !== defaultMetadata.updatedAt.getTime();

  if (!isOracleNew && !isDefaultNew) {
    console.log("Cards are already up to date. Skipping ingestion.");
  } else {
    const updatedBulks: string[] = [];
    if (isOracleNew) {
      updatedBulks.push(`Oracle (${oracleMetadata.updatedAt})`);
    }
    if (isDefaultNew) {
      updatedBulks.push(`Default (${defaultMetadata.updatedAt})`);
    }

    console.log(
      `New update(s) detected for: ${updatedBulks.join(", ")}. Starting full ingestion pipeline...`,
    );

    console.log("Cleaning staging tables.");
    await stagingRepository.clear();

    const [oracleStream, defaultStream] = await Promise.all([
      fetchBulkStream(oracleMetadata),
      fetchBulkStream(defaultMetadata),
    ]);

    await Promise.all([
      readZippedStream(
        oracleStream,
        stageOracleCards,
        SCRYFALL_BULK_TYPES.ORACLE,
      ),
      readZippedStream(
        defaultStream,
        stageCardHistories,
        SCRYFALL_BULK_TYPES.DEFAULT,
      ),
    ]);

    console.log("Consolidating into production database...");

    const affectedRows = await cardRepository.insertFromStaging();

    console.log(
      `Production database updated successfully. Rows affected: ${affectedRows}`,
    );

    await Promise.all([
      syncRepository.saveLastSync(oracleSyncKey, oracleMetadata.updatedAt),
      syncRepository.saveLastSync(defaultSyncKey, defaultMetadata.updatedAt),
    ]);

    const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Card ingestion pipeline completed in ${totalDuration}s.`);
  }
} catch (error) {
  console.error("Fatal ingestion error:", error);
  process.exitCode = 1;
} finally {
  await stagingRepository.clear();
  await prisma.$disconnect();
  console.log("Prisma connection closed.");
}
