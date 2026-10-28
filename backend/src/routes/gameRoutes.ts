import express from 'express';
import type { Request, Response } from 'express';
import { cardRepository, dailyGameRepository } from "../data/repositories";
import { GuessEntity } from "../types/game.types"
import { Prisma, GameMode, DailyGame, MagicCard } from "@prisma/client"

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({msg: "hw"});
})

router.get("/classic/init", async (req: Request, res: Response) => {
	try {
		const cardPool: MagicCard[] = await cardRepository.findAllPlayable();
		const today: Date = new Date();
		let dailyClassic: {id: string; targetCard: MagicCard} | null = await dailyGameRepository.find(today, GameMode.CLASSIC);
		if (!dailyClassic) {
			try {
				dailyClassic = await dailyGameRepository.create(cardPool[Math.floor(Math.random() * cardPool.length)].id, today, GameMode.CLASSIC);
				res.status(201);
			}
			catch (err) {
				if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
					dailyClassic = await dailyGameRepository.find(today, GameMode.CLASSIC);
					if (!dailyClassic) {
						throw Error;
					}
					res.status(200);
				}
				else {
					throw err;
				}
			}
		}
		else {
			res.status(200);
		}
	}
	catch (err) {
		return res.status(500).json({err: "database issue"});
	}
	return res.json()
})

router.get("/guess", async (req: Request, res: Response) => {
	const today: Date = new Date();
	try {
		const answer: {id: string; targetCard: MagicCard} | null = await dailyGameRepository.find(today, GameMode.CLASSIC);
		if (!answer) {

		}
		else {

		}
	}
	catch (err) {

	}
});

export default router