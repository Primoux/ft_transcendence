import type { Entity, AttributeResult, GuessResult } from "../../../types/game.types";

export function comparisonGame(guess: Entity, answer: Entity) {	
	let result: GuessResult;
	
	if (guess.id === answer.id)
	{
		result.win = true;
	}
	
	Object.keys(guess.attributes).forEach(([key, valueGuess]) => {
		const valueAnswer = answer.attributes[key];

		if (typeof valueGuess === "string") {
			if (valueGuess === valueAnswer) {
				result.attributes[key] = "correct";
			} else {
				result.attributes[key] = "incorrect";
			}
		} else if (typeof valueGuess === "number") {
			if (valueGuess === valueAnswer) {
				result.attributes[key] = "correct";
			} else if (valueGuess > valueAnswer) {
				result.attributes[key] = "lower";
			} else if (valueGuess < valueAnswer) {
				result.attributes[key] = "higher";
			}
		} else if (Array.isArray(valueGuess)) {
			if ([...valueGuess].sort().toString() === [...valueAnswer].sort().toString()) {
				result.attributes[key] = "correct";
			} else if (valueGuess.some(item => valueAnswer.includes(item))) {
				result.attributes[key] = "partially";
			} else {
				result.attributes[key] = "incorrect";
			}
		}
	});
}

export function imageGame(guess: Entity, answer: Entity) {
	let result: GuessResult;

	if (guess.id === answer.id) {
		result.win = true;
	}

	// TODO: add some color, or make image cleaner
}

export function descriptionGame(guess: Entity, answer: Entity) {
	let result: GuessResult;

	if (guess.id === answer.id) {
		result.win = true;
	}

	// TODO: if enough try, unlock clue
}
