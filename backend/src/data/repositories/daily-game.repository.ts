import type { GameMode, MagicCard } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const dailyGameRepository = {
  async create(targetCardId: string, date: Date, mode: GameMode) {
    return prisma.dailyGame.create({
      data: {
        date,
        mode,
        targetCardId,
      },
    });
  },
  async findByDateAndMode(date: Date, mode: GameMode) {
    return prisma.dailyGame.findUnique({
      where: {
        date_mode: {
          date,
          mode,
        },
      },
    });
  },
  async findTargetCard(id: string): Promise<MagicCard | null> {
    const dailyGame = await prisma.dailyGame.findUnique({
      where: { id },
      select: { targetCard: true },
    });
    return dailyGame?.targetCard ?? null;
  },
  async findOrCreate(targetCardId: string, date: Date, mode: GameMode) {
    return prisma.dailyGame.upsert({
      where: {
        date_mode: {
          date,
          mode,
        },
      },
      update: {},
      create: {
        date,
        mode,
        targetCardId,
      },
    });
  },
  async countByMode() {
    return prisma.dailyGame.groupBy({
      by: ["mode"],
      _count: true,
    });
  },
};
