import { prisma } from "../prisma";

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
	async create(sessionId: string, cardId: string) {
		return prisma.guess.create({
			data: {
				gameSessionId: sessionId,
				guessedCardId: cardId
			}
		});
	}
}