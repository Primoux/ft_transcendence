import { prisma } from "../prisma";

export const dailyGameRepository = {
  async findTargetCard(date: Date) {
    return await prisma.dailyGame.findUnique({
      where: { date },
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
