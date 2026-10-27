import type { Prisma, User, DailyGame } from "@prisma/client";
import { prisma } from "../prisma";

export const gameSessionRepository = {
	async findById(sessionId: string) {
		return prisma.gameSession.findUnique({
			where: {
				id: sessionId
			},
			include: {
				status: true,
				guesses: true
			}
		})
	},
	async findByUser(userId: string, dailyGameId: string) {
		return prisma.gameSession.findUnique({
			where: {
				userId_dailyGameId: {
					userId,
					dailyGameId
				}
			},
			include: {
				status: true,
				guesses: true
			}
	});
	},
	async create(userId: string, dailyGameId: string) {
		return prisma.gameSession.create({
			data: {
				userId,
				dailyGameId
			}
		})
	}
};
