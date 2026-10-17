import { GameMode } from "@prisma/client";
import { prisma } from "../prisma";

export const dailyGameRepository = {
  async findTargetCard(date: Date, mode: GameMode) {
    return prisma.dailyGame.findUnique({
      where: {
        date_mode: {
          date,
          mode,
        },
      },
      select: {
        targetCard: {
          select: {
            id: true,
            name: true,
            attributes: true,
          },
        },
      },
    });
  },
};
