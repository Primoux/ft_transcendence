import type { GameMode, Prisma } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const gameSessionRepository = {
  async create(userId: string, dailyGameId: string) {
    return prisma.gameSession.create({
      data: {
        userId,
        dailyGameId,
      },
    });
  },
  async findById(id: string) {
    return prisma.gameSession.findUnique({ where: { id } });
  },
  async findByUserAndDateAndMode(userId: string, date: Date, mode: GameMode) {
    return prisma.gameSession.findFirst({
      where: {
        userId,
        dailyGame: { date, mode },
      },
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
  async findWonSessionsSummary(userId: string): Promise<number[]> {
    const wonSession = await prisma.gameSession.findMany({
      where: {
        userId,
        status: "WON",
      },
      select: {
        _count: {
          select: { guesses: true },
        },
      },
    });
    return wonSession.map(({ _count: { guesses } }) => guesses);
  },
  async updateById(id: string, data: Prisma.GameSessionUpdateInput) {
    return prisma.gameSession.update({
      where: { id },
      data,
    });
  },
  async countSince(startDate: Date) {
    return prisma.gameSession.count({
      where: { createdAt: { gte: startDate } },
    });
  },
  async countByStatus() {
    return prisma.gameSession.groupBy({
      by: ["status"],
      _count: true,
    });
  },
};
