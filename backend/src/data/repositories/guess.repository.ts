import { prisma } from "../prisma";

export const guessRepository = {
	async create(sessionId: string, cardId: string) {
		return prisma.guess.create({
			data: {
				gameSessionId: sessionId,
				guessedCardId: cardId
			}
		});
	}
}