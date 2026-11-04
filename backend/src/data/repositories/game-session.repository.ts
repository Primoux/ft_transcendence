import { prisma } from "../prisma";

export const gameSessionRepository = {
  async findById(id: string) {
    return prisma.gameSession.findUnique({ where: { id } });
  },
  async findByUserAndDate(userId: string, date: Date) {
    return prisma.gameSession.findFirst({
      where: {
        userId,
        dailyGame: { date },
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
