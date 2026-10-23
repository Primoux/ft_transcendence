import express from 'express';
import { testCards, testAnswer, comparisonGame } from "../services/game/modes/gameModes";

const router = express.Router()

router.get("/", (req, res) => {
    res.json({msg: "hw"});
})

router.post("/guess", (req, res) => {
    const { entityId } = req.body;

    const guessedEntity = testCards.find((entity) => entity.id === entityId);

    if(!guessedEntity) {
        return res.status(404).json({error: "Entity not found",});
    }
    const result = comparisonGame(guessedEntity, testAnswer);

    return res.json(result);
});

export default router