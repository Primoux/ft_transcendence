import { GameMode } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const dailyGameRepository = {
  async findByDateAndMode(date: Date, mode: GameMode) {
    return prisma.dailyGame.findUnique({
      where: {
        date_mode: {
          date,
          mode
        }
      }
    });
  },
  async findTargetCard(dailyId: string) {
    return prisma.dailyGame.findUnique({
      where: {
        id: dailyId
      },
      select: {
        targetCard: true
      }
    });
  },
  async create(targetCardId: string, date: Date, mode: GameMode) {
    return prisma.dailyGame.create({
      data: {
        date,
        mode,
        targetCardId,
      },
    });
  },
};
