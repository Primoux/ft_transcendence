import { GameMode } from "@prisma/client";
import { prisma } from "../prisma";

export const dailyGameRepository = {
  async findByDateAndMode(date: Date, mode: GameMode) {
    return prisma.dailyGame.findUnique({
      where: {
        date_mode: {
          date,
          mode,
        },
      },
      include: { targetCard: true },
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
