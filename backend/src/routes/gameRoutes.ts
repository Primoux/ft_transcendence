import express, { raw } from 'express';
import type { Request, Response } from 'express';
import { cardRepository, dailyGameRepository } from "../data/repositories";
import { CardEntity, GuessEntity, GuessResult, AttributeStatus, ColorIdentity, Rarity as FrontRarity } from "../types/game.types"
import { Prisma, GameMode, DailyGame, MagicCard, Rarity as DatabaseRarity } from "@prisma/client"
import { guessSchema } from "../utils/validation/zodSchema"

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({msg: "hw"});
})

router.get("/classic/init", async (req: Request, res: Response) => {
	try {
		var cardPool = await cardRepository.findAllPlayable();
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
	const frontCardPool: GuessEntity[] = cardPool.map(item => ({
		id: item.id,
		name: item.name,
		artUrl: item.artUrl
	}));
	return res.json({pool: frontCardPool});
})

router.get("/guess", async (req: Request, res: Response) => {
	const parsedInput = guessSchema.safeParse(req.query)
	if (!parsedInput.success) {
		return res.status(404).json({err: parsedInput.error.issues});
	}
	let rawGuess: MagicCard | null;
	let rawAnswer: {targetCard: MagicCard} | null;
	const today: Date = new Date();
	try {
		rawGuess = await cardRepository.findById(parsedInput.data.card);
		if (!rawGuess) {
			return res.status(404).json({err: "no card found with id " + parsedInput.data.card});
		}
		let daily: DailyGame | null = await dailyGameRepository.find(today, GameMode.CLASSIC);
		if (!daily) {
			throw Error;
		}
		rawAnswer = await dailyGameRepository.findTargetCard(daily.id);
		if (!rawAnswer) {
			throw Error;
		}
	}
	catch (err) {
		return res.status(500).json({err: "database issue"});
	}
	try {	
		var guessEntity: CardEntity = buildCardEntity(rawGuess);
		var answerEntity: CardEntity = buildCardEntity(rawAnswer.targetCard);
	}
	catch (err) {
		return res.status(500).json({err: "couldn't resolve card properties"});
	}
	let result: GuessResult = {
		win: guessEntity.id === answerEntity.id,
		fullCardUrl: guessEntity.id === answerEntity.id ? rawGuess.imageUrl : undefined,
		card: guessEntity,
		comp: buildGuessComp(guessEntity, answerEntity)
	}
	return res.status(200).json({result: result});
});

const COLOR_IDENTITY_RECORD: Record<string, ColorIdentity> = {
  W: 'White',
  B: 'Black',
  U: 'Blue',
  R: 'Red',
  G: 'Green',
  C: 'Colorless'
} as const;

const RARITY_RECORD: Record<DatabaseRarity, FrontRarity> = {
	COMMON: 'Common',
	UNCOMMON: 'Uncommon',
	RARE: 'Rare',
	MYTHIC: 'Mythic',
	SPECIAL: 'Special',
	BONUS: 'Bonus'
} as const;

function buildCardEntity(rawCard: MagicCard): CardEntity {
	return {
		id: rawCard.id,
		name: rawCard.name,
		artUrl: rawCard.artUrl,
		manaValue: rawCard.manaValue,
		colorIdentity: rawCard.colorIdentity.map(stringColor => {
			const cardColor: ColorIdentity = COLOR_IDENTITY_RECORD[stringColor];
			if (cardColor === undefined) {
				throw Error;
			}
			return cardColor;
		}),
		legStatus: rawCard.supertypes.includes("Legendary"),
		types: rawCard.types,
		subtypes: rawCard.subtypes,
		// power: rawCard.power
		// toughness: rawCard.toughness,
		rarity: RARITY_RECORD[rawCard.rarity] ?? (() => {
			throw Error;
		})(),
		releaseSet: rawCard.releaseSet,
		releaseYear: rawCard.releaseDate.getFullYear()
	}
}

function buildGuessComp(guess: CardEntity, answer: CardEntity ): Record<string, AttributeStatus> {
	return {
		manaValue: compareNumber(guess.manaValue, answer.manaValue),
		colorIdentity: compareArray(guess.colorIdentity, answer.colorIdentity),
		legStatus: guess.legStatus === answer.legStatus ? "correct" : "incorrect",
		types: compareArray(guess.types, answer.types),
		subtypes: compareArray(guess.subtypes, answer.subtypes),
		// power: compareNumber(guess.power, answer.power)
		// toughness: compareNumber(guess.toughness, answer.toughness)
		rarity: guess.rarity === answer.rarity ? "correct" : "incorrect",
		releaseSet: guess.releaseSet === answer.releaseSet ? "correct" : guess.releaseYear === answer.releaseYear ? "partially" : "incorrect",
		releaseYear: compareNumber(guess.releaseYear, answer.releaseYear)
	}
}

const compareNumber = (a: number, b: number): AttributeStatus => {
	return (a === b ? "correct" : a < b ? "lower" : "higher");
}

const compareArray = (a: any[], b: any[]): AttributeStatus => {
	return (a.length === b. length && a.every((elt) => b.includes(elt)) ? "correct" : a.some((elt) => b.includes(elt)) ? "partially" : "incorrect");
}

export default router