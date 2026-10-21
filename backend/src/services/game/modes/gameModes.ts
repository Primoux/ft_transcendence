import type { Entity, AttributeResult, GuessResult } from "../../../types/game.types";

export const testCards: Entity[] = [
	{
		id: 1,
		name: "Card1",
		attributes: {
			colors: ["blue", "green"],
			deck: "Warhammer",
			mana: 4,
		}
	},
	{
		id: 2,
		name: "Card2",
		attributes: {
			colors: ["red", "blue"],
			deck: "Spider-Man",
			mana: 6,
		}
	},
	{
		id: 3,
		name: "Card3",
		attributes: {
			colors: ["blue"],
			deck: "Classic",
			mana: 1,
		}
	},
	{
		id: 4,
		name: "Card4",
		attributes: {
			colors: ["purple", "green"],
			deck: "Spider-Man",
			mana: 14,
		}
	},
];

export const testAnswer = testCards[1];

export function comparisonGame(guess: Entity, answer: Entity): GuessResult {	
	let result: GuessResult = {name: guess.name, win: guess.id === answer.id, attributes: guess.attributes, comparison: {}};
	
	for (const [key, valueGuess] of Object.entries(guess.attributes)) {
		const valueAnswer = answer.attributes[key];

		if (typeof valueGuess === "string") {
			if (valueGuess === valueAnswer) {
				result.comparison[key] = "correct";
			} else {
				result.comparison[key] = "incorrect";
			}
		} else if (typeof valueGuess === "number") {
			if (typeof valueAnswer !== "number") {
				result.comparison[key] = "incorrect";
			} else if (valueGuess === valueAnswer) {
				result.comparison[key] = "correct";
			} else if (valueGuess > valueAnswer) {
				result.comparison[key] = "lower";
			} else if (valueGuess < valueAnswer) {
				result.comparison[key] = "higher";
			}
		} else if (Array.isArray(valueGuess)) {
			if (!Array.isArray(valueAnswer)) {
				result.comparison[key] = "incorrect";
			} else {
				const sortedGuess = [...valueGuess].sort();
				const sortedAnswer = [...valueAnswer].sort();

				if (sortedGuess.length === sortedAnswer.length && sortedGuess.every((item, i) => item === sortedAnswer[i])) {
					result.comparison[key] = "correct";
				} else if (valueGuess.some(item => valueAnswer.includes(item))) {
					result.comparison[key] = "partially";
				} else {
					result.comparison[key] = "incorrect";
				}
			}
		}
	}

	return result;
}

export function imageGame(guess: Entity, answer: Entity) {
	let result: GuessResult = {name: guess.name, win: guess.id === answer.id, attributes: guess.attributes, comparison: {}};

	if (guess.id === answer.id) {
		result.win = true;
	}

	// TODO: add some color, or make image cleaner
}

export function descriptionGame(guess: Entity, answer: Entity) {
	let result: GuessResult = {name: guess.name, win: guess.id === answer.id, attributes: guess.attributes, comparison: {}};

	if (guess.id === answer.id) {
		result.win = true;
	}

	// TODO: if enough try, unlock clue
}
