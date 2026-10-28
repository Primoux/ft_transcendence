import express from 'express';
import type { Request, Response } from 'express';
import { cardRepository, dailyGameRepository } from "../data/repositories";
import { CardEntity, GuessEntity, GuessResult, AttributeStatus, ColorIdentity } from "../types/game.types"
import { Prisma, GameMode, DailyGame, MagicCard } from "@prisma/client"
import { guessSchema } from "../utils/validation/zodSchema"

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({msg: "hw"});
})

router.get("/classic/init", async (req: Request, res: Response) => {
	let cardPool: MagicCard[] = [];
	try {
		cardPool = await cardRepository.findAllPlayable();
		const today: Date = new Date();
		let dailyClassic: DailyGame | null = await dailyGameRepository.find(today, GameMode.CLASSIC);
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
	const parsedInput = guessSchema.safeParse(req.query)
	if (!parsedInput.success) {
		return res.status(404).json({err: parsedInput.error.issue});
	}
	let guessCard: MagicCard | null;
	let answer: {targetCard: MagicCard} | null;
	const today: Date = new Date();
	try {
		guessCard = await cardRepository.findById(parsedInput.data.card);
		if (!guessCard) {
			return res.status(404).json({err: "no card found with id " + parsedInput.data.card});
		}
		let daily: DailyGame | null = await dailyGameRepository.find(today, GameMode.CLASSIC);
		if (!daily) {
			throw Error;
		}
		answer = await dailyGameRepository.findTargetCard(daily.id);
		if (!answer) {
			throw Error;
		}
	}
	catch (err) {
		return res.status(500).json({err: "database issue"});
	}
	let result = {} as GuessResult;
	if (guessCard.id == answer.targetCard.id) {
		result.win = true;
	}
	let guessEntity = {} as CardEntity;
	try {
		buildCardEntity(guessCard, guessEntity);
		buildGuessComp(guessCard, answer.targetCard, result.comp);
	}
	catch (err) {
		return res.status(500).json({err: "couldn't resolve card properties"});
	}

});

const COLOR_IDENTITY_RECORD: Record<string, ColorIdentity> = {
  W: 'White',
  B: 'Black',
  U: 'Blue',
  R: 'Red',
  G: 'Green',
  C: 'Colorless',
} as const;

function buildCardEntity(rawCard: MagicCard, builtCardEntity: CardEntity) {

}

function buildGuessComp(rawGuess: MagicCard, rawAnswer: MagicCard, comp: Record<string, AttributeStatus>){

}

export default router