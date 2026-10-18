import { useState } from "react";
import type { FormEvent } from "react";
import type { GuessResult } from "./types/game.ts";

type GuessEntity = {
	id: number;
	name: string;
};

// type GuessRecord = {
// 	entity: GuessEntity;
// 	feedback?: Record<string, string>;
// };

const testEnt: GuessEntity[] = [
	{id: 1, name: "Card1"},
	{id: 2, name: "Card2"},
	{id: 3, name: "Card3"},
	{id: 4, name: "Card4"},
];

function DlePage() {
	const [input, setInput] = useState("");
	const [guesses, setGuesses] = useState<GuessResult[]>([]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		
		const entity = testEnt.find((item) => item.name === input );

		if (!entity) {
			console.error("Card not found");
			return;
		}
		
		try {

			const response = await fetch("/api/dle/guess", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({entityId: entity.id})
			});

			const result: GuessResult = await response.json();


			setGuesses((guess) => [...guess, result]);

			setInput("");
			console.log("Comparison result:", result);
		} catch (error) {
			console.error("Error in handleSubmit", error);
		}


	}
	
	return (
		<main>
			<h1>MagicDLE</h1>
			<h2>Classic mode</h2>
			<div>
				<form onSubmit={handleSubmit}>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Enter card name..."
					/>
					<button type="submit">Guess</button>
				</form>
			</div>

			<section>
				<h3>Attemps number: ({guesses.length})</h3>

				{guesses.length !== 0 && (
					<ul>
						{guesses.toReversed().map((guess) => (
							<li key={guess.name}>
								<h3>{guess.name}</h3>
								{Object.entries(guess.attributes).map(([attribute, feedback]) => (
									<div key={attribute} className={`rounded-md p-3 text-sm ${
										feedback === "correct"
										? "bg-green-100 text-green-900"
										: feedback === "incorrect"
											? "bg-red-100 text-red-900"
											: "bg-yellow-100 text-yellow-900"
									}`}>
										<p className="font-medium">{attribute}</p>
										<p>{feedback}</p>
									</div>
								))}
								<span>{guess.name}</span>

								{guess.win && (
									<p>You found the anwser! GG!</p>
								)}
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}

export default DlePage;