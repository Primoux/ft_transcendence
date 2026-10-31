import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const stagingRepository = {
  async createManyOracleCard(data: Prisma.StagingOracleCardCreateManyInput[]) {
    return prisma.stagingOracleCard.createMany({
      data,
    });
  },
  async createManyCardHistory(
    data: Prisma.StagingCardHistoryCreateManyInput[],
  ) {
    return prisma.stagingCardHistory.createMany({
      data,
    });
  },
  async clear() {
    return Promise.all([
      prisma.stagingOracleCard.deleteMany(),
      prisma.stagingCardHistory.deleteMany(),
    ]);
  },
};
