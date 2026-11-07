import { GameMode } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const gameSessionRepository = {
  async findById(id: string) {
    return prisma.gameSession.findUnique({ where: { id } });
  },
  async findByUserAndDateAndMode(userId: string, date: Date, mode: GameMode) {
    return prisma.gameSession.findFirst({
      where: {
        userId,
        dailyGame: { date, mode },
      },
      include: { dailyGame: true },
    });
  },
  async findByUserAndGame(userId: string, dailyGameId: string) {
    return prisma.gameSession.findUnique({
      where: {
        userId_dailyGameId: {
          userId,
          dailyGameId,
        },
      },
    });
  },
  async create(userId: string, dailyGameId: string) {
    return prisma.gameSession.create({
      data: {
        userId,
        dailyGameId,
      },
    });
  },
};
