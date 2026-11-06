import express, { raw } from 'express';
import type { Request, Response } from 'express';
import { cardRepository, dailyGameRepository } from "../data/repositories";
import { gameSessionRepository } from '../data/repositories/game-session.repository.ts';
import { CardEntity, GuessEntity, GuessResult, AttributeStatus, ColorIdentity, Rarity as FrontRarity } from "../types/game.types.ts"
import { Prisma, GameMode, DailyGame, MagicCard, Rarity as DatabaseRarity, GameSession, Guess } from "../../generated/client.ts"
import { guessSchema } from "../utils/validation/zodSchema"
import { guessRepository } from '../data/repositories/guess.repository.ts';

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({msg: "hw"});
})

router.get("/classic/init", async (req: Request, res: Response) => {
	if (!req.userId) { 
		return res.status(401).json({err: "no user logged"});
	}
	res.status(200);
	try {
		var cardPool: MagicCard[] = await cardRepository.findAllPlayable();
		const today: Date = new Date();
		var session: GameSession | null = await gameSessionRepository.findByUserAndDate(req.userId, today);
		if (!session) {
			let daily = await dailyGameRepository.findByDateAndMode(today, GameMode.CLASSIC);
			if (!daily) {
				try {
					daily = await dailyGameRepository.create(cardPool[Math.floor(Math.random() * cardPool.length)].oracleId, today, GameMode.CLASSIC);
					res.status(201);
				}
				catch (err) {
					if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
						daily = await dailyGameRepository.findByDateAndMode(today, GameMode.CLASSIC);
						if (!daily) {
							throw Error;
						}
					}
					else {
						throw err;
					}
				}
			}
			session = await gameSessionRepository.create(req.userId, daily.id);
			res.status(201);
		}
		let dailyCard: MagicCard | undefined = (await dailyGameRepository.findTargetCard(session.dailyGameId))?.targetCard;
		if (dailyCard === undefined)
			throw Error;
		var dailyCardEntity: CardEntity = buildCardEntity(dailyCard);
		var guessCardList: MagicCard[] = (await guessRepository.findBySession(session.id)).map(cardPair => Object.values(cardPair)[0]);
	}
	catch (err) {
		console.log("ERROR= ",err);
		return res.status(500).json({err: "database issue"});
	}
	const frontCardPool: GuessEntity[] = cardPool.map(item => ({
		id: item.oracleId,
		name: item.name,
		artUrl: item.artUrl
	}));
	try {
		var guessResultList: GuessResult[] = guessCardList.map(card => {
			let cardEntity = buildCardEntity(card);
			return ({
				win: cardEntity.id === dailyCardEntity.id,
				fullCardUrl: cardEntity.id === dailyCardEntity.id ? card.imageUrl : undefined,
				card: cardEntity,
				comp: buildGuessComp(cardEntity, dailyCardEntity)
			})
		})
	}
	catch (err) {
		console.log("error= ", err);
		return res.status(500).json({err: "couldn't resolve card properties"});
	}
	return res.json({pool: frontCardPool, session: session.id, guessResultList: guessResultList});
})

router.get("/guess", async (req: Request, res: Response) => {
	const parsedInput = guessSchema.safeParse(req.query)
	if (!parsedInput.success) {
		return res.status(404).json({err: parsedInput.error.issues});
	}
	try {
		var rawGuess: MagicCard | null = await cardRepository.findById(parsedInput.data.card);
		if (!rawGuess) {
			return res.status(404).json({err: "no card found with id " + parsedInput.data.card});
		}
		let session: GameSession | null = await gameSessionRepository.findById(parsedInput.data.session);
		if (!session) {
			return res.status(404).json({err: "no session found with id " + parsedInput.data.session});
		}
		var rawAnswer: MagicCard | undefined = (await dailyGameRepository.findTargetCard(session.dailyGameId))?.targetCard;
		if (rawAnswer === undefined) {
			throw Error;
		}
		await guessRepository.create(session.id, rawGuess.oracleId);
	}
	catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
			return res.status(406).json({err: "card already guessed for this game session"});
		}
		return res.status(500).json({err: "database issue"});
	}
	try {
		var guessEntity: CardEntity = buildCardEntity(rawGuess);
		var answerEntity: CardEntity = buildCardEntity(rawAnswer);
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

// router.post("/classic/session", async (req: Request, res: Response) => {
// 	try {
// 		// const userId = req.user.id;
// 		const dailyClassic: DailyGame = await dailyGameRepository.find(new Date(), GameMode.CLASSIC);
// 		if (!dailyClassic) {
// 			return res.status(404).json({error: "daily game not found"});
// 		}
// 		let sessionClassic: GameSession | null = await gameSessionRepository.findByGame("null", dailyClassic.id);
// 		if (!sessionClassic) {
// 			sessionClassic = await gameSessionRepository.createAnon( dailyClassic.id);
// 		}
// 		res.cookie("gameSession", sessionClassic.id, {
// 			httpOnly: true,
// 			sameSite: "strict",
// 			maxAge: 30 * 24 * 60 * 60 * 1000,
// 		});
// 		return res.status(200).json({success: true});
// 	} catch (err) {
// 		return res.status(500).json({success: false, error: "error init session"});
// 	}
// });

const COLOR_IDENTITY_RECORD: Record<string, ColorIdentity> = {
  WHITE: 'White',
  BLACK: 'Black',
  BLUE: 'Blue',
  RED: 'Red',
  GREEN: 'Green',
  COLORLESS: 'Colorless'
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
		id: rawCard.oracleId,
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
		power: rawCard.power === null ? undefined : rawCard.power.includes("*") ? "Variable" : rawCard.power,
		toughness: rawCard.toughness === null ? undefined : rawCard.toughness.includes("*") ? "Variable" : rawCard.toughness,
		rarity: RARITY_RECORD[rawCard.rarity] ?? (() => {
			throw Error;
		})(),
		releaseSet: rawCard.releaseSet,
		releaseYear: rawCard.releaseDate.getFullYear()
	}
}

function buildGuessComp(guess: CardEntity, answer: CardEntity ): Record<string, AttributeStatus> {
	return {
		manaValue: compareNumber(answer.manaValue, guess.manaValue),
		colorIdentity: compareArray(answer.colorIdentity, guess.colorIdentity),
		legStatus: guess.legStatus === answer.legStatus ? "correct" : "incorrect",
		types: compareArray(answer.types, guess.types),
		subtypes: compareArray(answer.subtypes, guess.subtypes),
		power: compareStringNumber(answer.power, guess.power),
		toughness: compareStringNumber(answer.toughness, guess.toughness),
		rarity: guess.rarity === answer.rarity ? "correct" : "incorrect",
		releaseSet: guess.releaseSet === answer.releaseSet ? "correct" : guess.releaseYear === answer.releaseYear ? "partially" : "incorrect",
		releaseYear: compareNumber(answer.releaseYear, guess.releaseYear)
	}
}

const compareNumber = (a: number, b: number): AttributeStatus => {
	return (a === b ? "correct" : a < b ? "lower" : "higher");
}

const compareArray = (a: any[], b: any[]): AttributeStatus => {
	return (a.length === b. length && a.every((elt) => b.includes(elt)) ? "correct" : a.some((elt) => b.includes(elt)) ? "partially" : "incorrect");
}

const compareStringNumber = (a: string | undefined, b: string | undefined): AttributeStatus => {
	if (a === b) {
		return "correct";
	}
	if (a === undefined || b === undefined || a === "Variable" || b === "Variable") {
		return "incorrect";
	}
	return (a.localeCompare(b, undefined, {numeric: true}) < 0 ? "lower" : "higher");
}

export default router
