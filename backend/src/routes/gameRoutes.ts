import express from 'express';
import type { Request, Response } from 'express';
import { testCards, testAnswer, comparisonGame } from "../services/game/modes/gameModes";
import { cardRepository, dailyGameRepository } from "../data/repositories";
import { GuessEntity } from "../types/game.types"
import { Prisma, GameMode, User, DailyGame, MagicCard, GameSession } from "@prisma/client"
import { gameSessionRepository } from '../data/repositories/game-session.repository';

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({msg: "hw"});
})

router.get("/classic/init", async (req: Request, res: Response) => {
	try {
		const cardPool: MagicCard[] = await cardRepository.findAllPlayable();
		if (cardPool.length == 0)
			throw Error;
		const user: User = {}; //todo: get current user
		const today: Date = new Date();
		let currentSession: GameSession | null = await gameSessionRepository.findByDate(user.id, today);
		if (!currentSession) {
			let dailyClassic: DailyGame | null = await dailyGameRepository.find(today, GameMode.CLASSIC);
			if (!dailyClassic) {
				try {
					dailyClassic = await dailyGameRepository.create(cardPool[Math.floor(Math.random() * cardPool.length)].id, today, GameMode.CLASSIC);
				}
				catch (err) {
					if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
						dailyClassic = await dailyGameRepository.find(today, GameMode.CLASSIC);
						if (!dailyClassic) {
							throw Error;
						}
					}
					else {
						throw err;
					}
				}
			}
			try {
				currentSession = await gameSessionRepository.create(user.id, dailyClassic.id);
			}
			catch (err) {
				if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
					currentSession = await gameSessionRepository.findByGame(user.id, dailyClassic.id);
					if (!currentSession) {
						throw Error;
					}
					else {
						throw err;
					}
				}
			}
		}

	}
	catch (err) {
		return res.status(500).json({err: "database issue"});
	}


})

router.get("/guess", async (req: Request, res: Response) => {
	try {
		const answer: MagicCard = dailyGameRepository.findTargetCard(today, GameMode.CLASSIC);
		if (!answer) {

		}
		else {

		}
	}
	catch (err) {

	}
});

export default router