import { GameMode } from "@prisma/client";
import { prisma } from "../prisma";

export const dailyGameRepository = {
  async find(date: Date, mode: GameMode) {
    return prisma.dailyGame.findUnique({
      where: {
        date_mode: {
          date,
          mode,
        },
      },
      select: {
        id: true,
        targetCard: true
      }
    });
  },
 	async create(cardId: string, date: Date, mode: GameMode) {
		return prisma.dailyGame.create({
			data: {
        date,
        mode,
				targetCardId: cardId,
			}
		})
	}
};
