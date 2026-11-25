import express from "express";
import type { Request, Response } from 'express';
import { Achievement, UserAchievement, Category } from "../../generated/client.ts"
import { achievementRepository, guessRepository, gameSessionRepository} from "../data/repositories/index.ts";

const router = express.Router();

router.get("/achievements/guess", async (req: Request, res: Response) => {
	if (req.userId === undefined || !req.userId) {
		return res.status(401).json({err: "no user logged"});
	}
	res.status(200);
	let newAchievements: {title: string, desc: string, icon: string}[] = [];
	try {
		var nbGuesses: number = await guessRepository.countByUserId(req.userId);
		var guessAchievements: Achievement[] = await achievementRepository.findByCategory(Category.GUESS);
		guessAchievements.forEach(async elt => {
			if (elt.targetValue == null) {
				return res.status(500).json({err: "guess achievement is not properly setup"});
			}
			if (elt.targetValue <= nbGuesses) {
				let unlocked: UserAchievement = await achievementRepository.unlockForUser(req.userId, elt.id);
				if (unlocked) {
					res.status(201);
					newAchievements.push({title: elt.title, desc: elt.description, icon: elt.icon});
				}
			}
		})
	}
	catch (err) {
		return res.status(500).json({err: "database error"});
	}
	return res.json(newAchievements);
});

router.get("/achievements/win", async (req: Request, res: Response) => {
	if (req.userId === undefined || !req.userId) {
		return res.status(401).json({err: "no user logged"});
	}
	res.status(200);
	let newAchievements: {title: string, desc: string, icon: string}[] = [];
	try {
		var nbWins: number = await gameSessionRepository.countWins(/* need to be able to count all won game sessions for a specific user */);
		var winAchievements: Achievement[] = await achievementRepository.findByCategory(Category.WIN);
		winAchievements.forEach(async elt => {
			if (elt.targetValue == null) {
				return res.status(500).json({err: "guess achievement is not properly setup"});
			}
			if (elt.targetValue <= nbWins) {
				let unlocked: UserAchievement = await achievementRepository.unlockForUser(req.userId, elt.id);
				if (unlocked) {
					res.status(201);
					newAchievements.push({title: elt.title, desc: elt.description, icon: elt.icon});
				}
			}
		})
	}
	catch (err) {
		return res.status(500).json({err: "database error"});
	}
	return res.json(newAchievements);
});