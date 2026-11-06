import type { GuessEntity, GuessResult } from "./types/game";

type CardSearchCache = {
	version: number;
	cards: GuessEntity[];
	session: string;
	history: GuessResult[];
};

export async function getGuessEntities(): Promise<CardSearchCache> {
	//? fetch to get version
	// if (!response.ok) {
	// 	throw
	// }

	// const cached = localStorage.getItem("search_cards");
	// if (cached) {
	// 	const guesses = JSON.parse(cached);

	// 	//! maybe to change if multiple routes
		
	// 	//? check guesses.version against fetch version
	// 	return guesses; 
	// }

	const response = await fetch("/api/dle/classic/init");
	if (!response.ok) {
		throw new Error("Error: couldn't fetch cards for search bar");
	}

	const game_info = await response.json();

	console.log("Ginfo", game_info);

	const guesses: CardSearchCache = {
		version: 1,
		cards: game_info.pool,
		session: game_info.session,
		history: game_info.guessResultList
	}
	console.log("guesssss", guesses);
	
	localStorage.setItem("search_cards", JSON.stringify(guesses.cards));


	return guesses;
}