import { prisma } from "../prisma.ts";

export const guessRepository = {
	async findBySession(sessionId: string) {
		return prisma.guess.findMany({
			where: {
				gameSessionId: sessionId
			},
			orderBy: {
				attemptNumber: "asc"
			},
			select: {
				guessedCard: true
			}
		});
	},
  async create(gameSessionId: string, guessedCardId: string) {
    const existingGuessesCount = await prisma.guess.count({
      where: { gameSessionId },
    });

    return prisma.guess.create({
      data: {
        gameSessionId,
        guessedCardId,
        attemptNumber: existingGuessesCount + 1,
      },
    });
  },
};