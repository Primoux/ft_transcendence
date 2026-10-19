import express from 'express';
import { type Request, type Response } from 'express';
import { prisma } from "../lib/prisma.ts"; 

type Card = {
	id:	number;
	name: string;
	release_date: string;
	mana_cost: number;
	color_identity: string;
	artwork: string;
};

const router = express.Router();

router.get("/", (req, res) => {
	res.json({msg: "hw"});
})

router.get("/search/:input", async (req: Request, res: Response) => {
	try {
		const list: Card[] = await prisma.cards.findMany({
			where: {
				name: {
					contains: req.params.input
				}
			}
		});
		if (!list) {
			res.status(404).json(null);
		}
		else {
			res.status(200).json(list);
		}
	}
	catch (err) {
		res.status(500).json({error: "database is down"})
	}
});

router.get("/classic/:id", async (req: Request, res: Response) => {
// TODO: compare the content of req with the daily card (in db)
	try {
		const guess: Card = await prisma.cards.first({id: req.params.id});
		if (!guess) {
			res.status(404).json(null);
		}
		else {
			res.status(200).json(guess);
		}
	}
	catch (err) {
		res.status(500).json({error: "database is down"});
	}

});


/*
router.get("/unlimited", (req, res) => {

// TODO: same as above, but with a card in the user db (unlimited is specific by users)

})
*/


/*
router.post("/classic", async (req, res) => {

// TODO: select a daily card for classic mode and put it inside the daily db (if one is not already present)

})
*/

/*
router.post("/unlimited",  (req, res) =>{

// TODO : same as above, but for unlimited mode (in user db, no matter if one exists or not)

})
*/

export default router