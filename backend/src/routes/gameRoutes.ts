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

type DailyCard = {
	card: Card;
	date: string;
}

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
		if (list.length == 0) {
			res.status(404);
		}
		else {
			res.status(200).json(list);
		}
	}
	catch (err) {
		res.status(500).json({error: "database error"})
	}
});

router.get("/classic/:id", async (req: Request, res: Response) => {
// TODO: compare the content of req with the daily card (in db)
	try {
		const guess: Card = await prisma.cards.findUnique({id: req.params.id});
		if (!guess) {
			res.status(404).json(null);
		}
		else {
			res.status(200).json(guess);
		}
	}
	catch (err) {
		res.status(500).json({error: "database error"});
	}

});

/*
router.get("/unlimited", (req, res) => {

// TODO: same as above, but with a card in the user db (unlimited is specific by users)

})
*/



router.post("/classic/:date", async (req: Request, res: Response) => {
// TODO: select a daily card for classic mode and put it inside the daily db (if one is not already present)
	try {
		const daily_card: DailyCard = await prisma.daily.findUnique({date: req.params.date});
		if (!daily_card) {
			const random_card: Card = await prisma.cards.findUnique({
				where: {
					id: {
						equals: 1
					}
				}
			});
			try {
				const new_daily: DailyCard = await prisma.daily.create({random_card, date: req.params.date});
				res.status(201).json(new_daily);
			}
			catch (err) {
				const daily_check: DailyCard = await prisma.daily.findUnique({date: req.params.date});
				if (!daily_check) {
					res.status(500).json({error: "database error"});
				}
				else {
					res.status(200).json(daily_card);
				}
			}
		}
		else {
			res.status(200).json(daily_card);
		}
	}
	catch (err) {
		res.status(500).json({error: "database error"});
	}
})


/*
router.post("/unlimited",  (req, res) =>{

// TODO : same as above, but for unlimited mode (in user db, no matter if one exists or not)

})
*/

export default router