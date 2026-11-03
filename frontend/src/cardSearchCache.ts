import type { GuessEntity } from "./types/game";

type CardSearchCache = {
	version: number;
	cards: GuessEntity[];
};

export async function getGuessEntities(): Promise<GuessEntity[]> {
	//? fetch to get version
	// if (!response.ok) {
	// 	throw
	// }

	const cached = localStorage.getItem("search_cards");
	if (cached) {
		const guesses = JSON.parse(cached);
		//? check guesses.version against fetch version
		return guesses.cards; 
	}

	const response = await fetch("/api/dle/classic/init");
	if (!response.ok) {
		throw new Error("Error: couldn't fetch cards for search bar");
	}

	const cards: {pool: GuessEntity[]} = await response.json();

	const guesses: CardSearchCache = {
		version: 1,
		cards: cards.pool,
	}
	
	localStorage.setItem("search_cards", JSON.stringify(guesses));


	return guesses.cards;
}