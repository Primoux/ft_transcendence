import type { ScryfallBulkType } from "../../scripts/ingest/scryfall/types.ts";
import { prisma } from "../prisma.ts";

export type SyncKey = `scryfall_${ScryfallBulkType}`;

export const scryfallSyncRepository = {
  async getLastSync(key: SyncKey): Promise<Date | null> {
    const record = await prisma.scryfallSyncCard.findUnique({
      where: { key },
    });
    return record ? record.lastSyncAt : null;
  },
  async saveLastSync(key: SyncKey, date: Date): Promise<void> {
    await prisma.scryfallSyncCard.upsert({
      where: { key },
      update: { lastSyncAt: date },
      create: { key, lastSyncAt: date },
    });
  },
  async findAll() {
    return prisma.scryfallSyncCard.findMany();
  },
};
