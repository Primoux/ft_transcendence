import type { Prisma } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const stagingRepository = {
  async createManyOracleCard(data: Prisma.StagingOracleCardCreateManyInput[]) {
    return prisma.stagingOracleCard.createMany({
      data,
      skipDuplicates: true,
    });
  },
  async createManyCardHistory(
    data: Prisma.StagingCardHistoryCreateManyInput[],
  ) {
    return prisma.stagingCardHistory.createMany({
      data,
      skipDuplicates: true,
    });
  },
  async clear(): Promise<Prisma.BatchPayload[]> {
    return Promise.all([
      prisma.stagingOracleCard.deleteMany(),
      prisma.stagingCardHistory.deleteMany(),
    ]);
  },
};
