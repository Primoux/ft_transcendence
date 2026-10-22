import type { CardEntity, AttributeStatus, GuessResult } from "../../../types/game.types";

export const testCards: CardEntity[] = [
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

export function comparisonGame(guess: CardEntity, answer: CardEntity): GuessResult {	
	let result: GuessResult = {name: guess.name, win: guess.id === answer.id, attributes: {}};
	
	for (const [key, valueGuess] of Object.entries(guess.attributes)) {
		const valueAnswer = answer.attributes[key];

		if (typeof valueGuess === "string") {
			if (valueGuess === valueAnswer) {
				result.attributes[key].status = "correct";
			} else {
				result.attributes[key].status = "incorrect";
			}
		} else if (typeof valueGuess === "number") {
			if (typeof valueAnswer !== "number") {
				result.attributes[key].status = "incorrect";
			} else if (valueGuess === valueAnswer) {
				result.attributes[key].status = "correct";
			} else if (valueGuess > valueAnswer) {
				result.attributes[key].status = "lower";
			} else if (valueGuess < valueAnswer) {
				result.attributes[key].status = "higher";
			}
		} else if (Array.isArray(valueGuess)) {
			if (!Array.isArray(valueAnswer)) {
				result.attributes[key].status = "incorrect";
			} else {
				const sortedGuess = [...valueGuess].sort();
				const sortedAnswer = [...valueAnswer].sort();

				if (sortedGuess.length === sortedAnswer.length && sortedGuess.every((item, i) => item === sortedAnswer[i])) {
					result.attributes[key].status = "correct";
				} else if (valueGuess.some(item => valueAnswer.includes(item))) {
					result.attributes[key].status = "partially";
				} else {
					result.attributes[key].status = "incorrect";
				}
			}
		}
	}

	return result;
}

