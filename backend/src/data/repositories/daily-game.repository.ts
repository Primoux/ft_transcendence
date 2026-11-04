import { GameMode } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const dailyGameRepository = {
  async findTargetCard(date: Date, mode: GameMode) {
    return prisma.dailyGame.findUnique({
      where: {
        date_mode: {
          date,
          mode,
        },
      },
      select: { targetCard: true },
    });
  },
};
