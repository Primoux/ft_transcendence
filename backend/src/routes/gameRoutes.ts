import express from 'express';
import type { Request, Response } from 'express';
import { testCards, testAnswer, comparisonGame } from "../services/game/modes/gameModes";
import { cardRepository } from "../data/repositories/card.repository";
import { GuessEntity } from "../types/game.types"

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({msg: "hw"});
})

router.get("/search/:input",  async (req: Request, res: Response) => {
	try {
		const dbMatch = await cardRepository.searchByName(req.params.input);
		if (!dbMatch) {
			res.status(404).json({err: "no found match for " + req.params.input});
		}
		else {
			// const guessList: GuessEntity[] = [];
			// for (var dbCard of dbMatch) {
			// 	guessList.push({id: dbCard.id, name: dbCard.name, image: dbCard.image});

			// }
			res.status(200).json(dbMatch);
		}
	}
	catch (err) {
		res.status(500).json({err: "database error"});
	}
	return res;
})

router.post("/guess", (req: Request, res: Response) => {
    const { entityId } = req.body;

    const guessedEntity = testCards.find((entity) => entity.id === entityId);

    if(!guessedEntity) {
        return res.status(404).json({error: "entity not found",});
    }
    const result = comparisonGame(guessedEntity, testAnswer);

    return res.json(result);
});

export default router