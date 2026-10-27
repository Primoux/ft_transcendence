import { useState } from "react";
import type { FormEvent } from "react";
import type { GuessResult } from "../types/game.ts";
import SwapRes from "../components/game/SwapRes.tsx";
import DelayedDiv from "../components/game/DelayedDiv.tsx";
import GuessInput from "../components/game/GuessInput.tsx";

type GuessEntity = {
	id: number;
	name: string;
};

const testEnt: GuessEntity[] = [
	{id: 1, name: "Card1"},
	{id: 2, name: "Card2"},
	{id: 3, name: "Card3"},
	{id: 4, name: "Card4"}
];

function DlePage() {
	const [input, setInput] = useState("");
	const [guesses, setGuesses] = useState<GuessResult[]>([]);
	const [summary, setSummary] = useState<GuessResult>({
		name: "summary",
		win: false,
		attributes: {},
		comparison: {}
	});
	const [refreshKey, setRefreshKey] = useState(0);

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

			setSummary((guess) => updateSummary(guess, result));

			setRefreshKey(guess => guess + 1);

			setInput("");
			console.log("Comparison result:", result);
		} catch (error) {
			console.error("Error in handleSubmit", error);
		}
	}

	// TODO: refacto for readability (wip)
	function updateSummary(summary: GuessResult, guess: GuessResult): GuessResult {
		const updatedSummary: GuessResult = {
			...summary, attributes: {...summary.attributes}, comparison: {...summary.comparison}
		};
		for (const [name, value] of Object.entries(guess.attributes)) {
			if (summary.comparison[name] === "correct") {
				continue ;
			}
			if (guess.comparison[name] === "incorrect" && summary.comparison[name] !== undefined && summary.comparison[name] !== "incorrect")
			{
				continue ;
			}
			updatedSummary.comparison[name] = guess.comparison[name];
			if (guess.comparison[name] === "correct") {
				updatedSummary.attributes[name] = value;
			} else {
				if (typeof value === "string") {
					updatedSummary.attributes[name] = "N/A";
				} else if (typeof value === "number") {
					if (updatedSummary.attributes[name] === undefined) {
						updatedSummary.attributes[name] = [-1, -1];
					}
					if (Array.isArray(updatedSummary.attributes[name]) && typeof updatedSummary.attributes[name][0] === "number" && typeof updatedSummary.attributes[name][1] === "number") {
						if (guess.comparison[name] === "higher" && updatedSummary.attributes[name][0] < value) {
							updatedSummary.attributes[name][0] = value + 1;
						}
						if (guess.comparison[name] === "lower" && (updatedSummary.attributes[name][1] > value || updatedSummary.attributes[name][1] < 0)) {
							updatedSummary.attributes[name][1] = value - 1;
						}
					}
				} else if (Array.isArray(value)) {
					if (guess.comparison[name] === "partially" && value.length === 1) {
						if (updatedSummary.attributes[name] === undefined) {
							updatedSummary.attributes[name] = [];
						}
						if (Array.isArray(updatedSummary.attributes[name]) && updatedSummary.attributes[name].every(item => typeof item === "string") && typeof value[0] === "string") {
							if (updatedSummary.attributes[name].includes("N/A")) {
								updatedSummary.attributes[name] = [];
							}
							if (updatedSummary.attributes[name].every(item => typeof item === "string") && !updatedSummary.attributes[name].includes(value[0])) {
								updatedSummary.attributes[name].push(value[0]);
							}
						}
					} 
					else if (updatedSummary.attributes[name] === undefined) {
						updatedSummary.attributes[name] = ["N/A"];
					}
				}
			}
		}
		return updatedSummary;
	}

	return (
	<main>

		<h1>MagicDLE</h1>
		<h2>Classic mode</h2>
		<section>
			{guesses.length === 0 && (
				<div>
					<GuessInput input={input} setInput={setInput} submitFunc={handleSubmit}/>
				</div>
			)}
		</section>

		<section>
			{guesses.length > 0 && (
			<div>
				<div>
					{guesses.at(-1)!.win 
					? (	<p>GG!<br/>You've won in {guesses.length} guesses!</p>)
					: (	<div>
							<GuessInput input={input} setInput={setInput} submitFunc={handleSubmit}/>
							<table className="table-auto">
								<tbody key={refreshKey}>
									<tr>
										<td key="summary">Summary</td>
										{Object.entries(summary.attributes).map(([name, value], i) => {
											const nbRangeCheck = (Array.isArray(value) && value.every(item => typeof item === "number") && value[0] === value[1])
												? "correct"
												: summary.comparison[name];
											const feedback = nbRangeCheck;
											const color = 
												feedback === "correct"
												? "bg-green-100 text-green-900"
												: feedback === "incorrect"
													? "bg-red-100 text-red-900"
													: "bg-yellow-100 text-yellow-900"
											return (
												<td key={name} className="p-2">
													<DelayedDiv key={summary.name} delay={400 * i }>															
														<SwapRes key={summary.name} delay={(400 * i) + (300)} onMsg={
															<div className={`rounded-md p-3 text-sm ${color}`}>
															{Array.isArray(value) ? 
																value.every(item => typeof item === "number")
																	? value[1] === value[0]
																		? value[0]
																		: value[0] === -1
																			? value[1] + 1 + "↓"
																			: value[1] === -1
																				? value[0] - 1 + "↑"
																				: value.join(" - ")
																	: value.join(", ")
																: value}
															{typeof value === "number"
																? feedback === "higher"
																	? "↑"
																	: feedback === "lower"
																		? "↓"
																		: "" : ""
															}
															</div>} offMsg="idk" />
													</DelayedDiv>
												</td>
											)}
										)}
									</tr>
								</tbody>
							</table>
						</div>)
					}

					<table className="table-auto">
						<thead>
							<tr key="attributesName">
								<th key="empty" className="p-3"></th>
								{Object.keys(guesses[0].comparison).map((name) => (
									<th key={name} className="p-3">{name.charAt(0).toUpperCase() + name.slice(1)}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{guesses.toReversed().map((guess, index) => {
								const isLastGuess = index === 0;
								return (
								<tr key={guess.name}>
									<td key={index} className="p-2">{guess.name}</td>
									{Object.entries(guess.attributes).map(([name, value], i) => {
									const feedback = guess.comparison[name];
									const color =
										feedback === "correct"
										? "bg-green-100 text-green-900"
										: feedback === "incorrect"
											? "bg-red-100 text-red-900"
											: "bg-yellow-100 text-yellow-900"

									return (
										<td key={name} className="p-2">
											{
												isLastGuess
												? 
													(
															<DelayedDiv key={guess.name} delay={400 * i }>
														
																<SwapRes key={guess.name} delay={(400 * i) + (300)} onMsg={
																	<div className={`rounded-md p-3 text-sm ${color}`}>
																	{Array.isArray(value) ? value.join(", ") : value}
																	{
																		feedback === "higher"
																		? "↑"
																		: feedback === "lower"
																			? "↓"
																			: ""
																	}
																	</div>} offMsg="idk" />
															</DelayedDiv>
														)
												
											: (<div className={`rounded-md p-3 text-sm ${color}`}>
													{Array.isArray(value) ? value.join(", ") : value}
													{
														feedback === "higher"
														? "↑"
														: feedback === "lower"
															? "↓"
															: ""
													}
													</div>)
											}
										</td>
									)})}
								</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>
			)}
		</section>
	</main>
	);

}

export default DlePage;
