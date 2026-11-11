import { prisma } from "../prisma.ts";

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
  async findBySession(sessionId: string) {
    const guesses = await prisma.guess.findMany({
      where: {
        gameSessionId: sessionId,
      },
      orderBy: {
        attemptNumber: "asc",
      },
      select: {
        guessedCard: true,
      },
    });
    return guesses.map(({ guessedCard }) => guessedCard);
  },
  async countAll() {
    return prisma.guess.count();
  },
};
