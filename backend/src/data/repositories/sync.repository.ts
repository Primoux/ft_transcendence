import type { ScryfallBulkType } from "../../scripts/ingest/scryfall-client.ts";
import { prisma } from "../prisma.ts";

export type SyncKey = `scryfall_${ScryfallBulkType}`;

export const syncRepository = {
  async getLastSync(key: SyncKey): Promise<Date | null> {
    const record = await prisma.cardSync.findUnique({
      where: { key },
    });
    return record ? record.lastSyncAt : null;
  },

  async saveLastSync(key: SyncKey, date: Date): Promise<void> {
    await prisma.cardSync.upsert({
      where: { key },
      update: { lastSyncAt: date },
      create: { key, lastSyncAt: date },
    });
  },
};
