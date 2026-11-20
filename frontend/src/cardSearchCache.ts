import type { GuessEntity, GuessResult } from "./types/game";
import Dexie from "dexie";

type CardSearchCache = {
	version: number;
	cards: GuessEntity[];
	session: string;
	history: GuessResult[];
};

const db = new Dexie("search_cards");
db.version(1).stores({cards: "id, name, artUrl"});

export async function getGuessEntities(): Promise<CardSearchCache> {
	const response = await fetch("/api/dle/classic/init");
	if (!response.ok) {
		throw new Error("Error: couldn't fetch cards for search bar");
	}

	const game_info = await response.json();

	const guesses: CardSearchCache = {
		version: 1,
		cards: game_info.pool,
		session: game_info.session,
		history: game_info.guessResultList
	}
	
	// await db.table("cards").bulkPut(guesses.cards);
	console.log("Cards received:", guesses.cards.length);

	await db.table("cards").bulkPut(guesses.cards);

	console.log("Cards stored:", await db.table("cards").count());

	return guesses;
}