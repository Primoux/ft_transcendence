import { prisma } from "../prisma";

export const guessRepository = {
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
