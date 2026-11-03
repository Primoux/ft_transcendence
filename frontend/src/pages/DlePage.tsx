import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { GuessEntity, CardEntity, GuessResult, SummaryEntity, AttributeStatus } from "../types/game.ts";
import GuessInput from "../components/game/GuessInput.tsx";
import AttributeCell from "../components/game/AttributeCell.tsx";

import {getGuessEntities} from "../cardSearchCache.ts";

function DlePage() {
	const [input, setInput] = useState("");
	const [search, setSearch] = useState<GuessEntity[]>([]);
	const [loading, setLoading] = useState(true);
	const [guesses, setGuesses] = useState<GuessResult[]>([]);
	const [summary, setSummary] = useState<SummaryEntity>({
		legStatus: false,
		comp: {}
	});
	const [refreshKey, setRefreshKey] = useState(0);


	async function initGameSession(): Promise<void> {
		const response = await fetch(`/api/dle/classic/session`, {method: "POST"});
		if (!response.ok) {
			throw new Error("error: no game sesh");
		}
	}

	useEffect(() => {
		// async function initialize() {
		// 	try {
		// 		await initGameSession();
		// 		const cards = await getGuessEntities();
		// 		setSearch(cards);
		// 	} catch (err) {
		// 		console.error("init failed", err);
		// 	} finally {
		// 		setLoading(false);
		// 	}
		// }

		// initialize();
		getGuessEntities().then(setSearch).finally(() => setLoading(false));
	}, []);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// TODO: ask db and load in cache

		const entity = search.find((item: GuessEntity) => item.name === input );

		if (!entity) {
			console.error("Card not found");
			return;
		}

		const params = new URLSearchParams({
			session: "banana",
			card: entity.id
		})

		try {
			// const params = new URLSearchParams({guess: input});

			// const response = await fetch(`/api/dle/guess?${params.toString()}`);
			const response = await fetch(`/api/dle/guess?${params.toString()}`);
			const result: GuessResult = await response.json();

			// setGuesses((guess) => [...guess, result]);
			// setGuesses((prev) => [...prev, result]);
			guesses.push(result.result);

			console.log("result: ", result);
			console.log("guesses length: ", guesses.length);
			console.log("guess: ", guesses[guesses.length - 1]);

			setSummary((guess) => updateSummary(guess, result.result));

			setRefreshKey(guess => guess + 1);

			setInput("");
			console.log("Comparison result:", result);
		} catch (error) {
			console.error("Error in handleSubmit", error);
		}
	}

	function updateNumber(comp: number, status:AttributeStatus, high?: number, low?:number) {
		if (low === undefined && high === undefined) {
			if (status === "higher") {
				low = comp;
			} else if (status === "lower") {
				high = comp;
			} else if (status === "correct") {
				high = comp;
				low = comp;
			}
		}
		else if (low === undefined || low >= comp) {
			low = comp;
		}
		else if (high === undefined || high <= comp) {
			high = comp;
		}
		return {high, low};
	}

	function updateArray<T>(src: T[], dst?: T[]): T[] {
		if (dst === undefined) {
			dst = [];
		}
		if (src.length === 1 && !dst.includes(src[0])) {
			dst.push(src[0]);
		}
		return dst;
	}

	function updateAttribute<key extends keyof CardEntity>(
		dst: SummaryEntity, src: CardEntity, key: key
	) {
		switch (key) {
			case "manaValue":
			{
				const {high, low} = updateNumber(src.manaValue, dst.comp["manaValue"], dst.manaHigh, dst.manaLow)
				dst.manaHigh = high;
				dst.manaLow = low;
			}
				break;
			case "colorIdentity":
				dst.colorIdentity = updateArray(src.colorIdentity, dst.colorIdentity);
				break;
			case "types":
				dst.types = updateArray(src.types, dst.types);
				break;
			case "power":
				if (src.power) {
					const {high, low} = updateNumber(src.power, dst.comp["power"], dst.powerHigh, dst.powerLow);
					dst.powerHigh = high;
					dst.powerLow = low;
				}
				break;
			case "toughness":
				if (src.toughness) {
					const {high, low} = updateNumber(src.toughness, dst.comp["toughness"], dst.toughnessHigh, dst.toughnessLow);
					dst.toughnessHigh = high;
					dst.toughnessLow = low;
				}
				break;
			case "legStatus":
				dst.legStatus = src.legStatus;
				break;
			case "rarity":
				dst.rarity = src.rarity;
				break;
			case "set":
				dst.set = src.set;
				break;
			case "releaseYear":
			{
				const {high, low} = updateNumber(src.releaseYear, dst.comp["releaseYear"], dst.releaseYearHigh, dst.releaseYearLow);
				dst.releaseYearHigh = high;
				dst.releaseYearLow = low;
			}
				break;
			default:
				break;
		}
	}

	function initSummary(guess: GuessResult): SummaryEntity {
		const summary: SummaryEntity = {
			legStatus: guess.card.legStatus,
			comp: {...guess.comp}
		};

		const keys = Object.keys(guess.card) as (keyof CardEntity)[];
		for (const key of keys) {
			summary.comp[key] = guess.comp[key];
			if (key === "legStatus" && summary.legStatus === false) {
				summary.legStatus = true;
				summary.comp[key] = "correct";
				continue ;
			}
			if (summary.comp[key] !== "incorrect")	{
				updateAttribute(summary, guess.card, key);
			}
		}
		return summary;
	}

	function updateSummary(summary: SummaryEntity, guess: GuessResult): SummaryEntity {
		if (summary === undefined) {
			return initSummary(guess); 
		}
		const updatedSummary: SummaryEntity = {
			...summary, comp: {...summary.comp}
		};

		// console.log("gc===", guess.result.card);
		const keys = Object.keys(guess.card) as (keyof CardEntity)[];
		for (const key of keys) {
			if (summary.comp[key] === "correct") {
				continue ;
			}
			if (guess.comp[key] === "incorrect" && summary.comp[key] !== undefined && summary.comp[key] !== "incorrect") {
				continue ;
			}
			updatedSummary.comp[key] = guess.comp[key];
			if (key === "legStatus" && updatedSummary.legStatus === false) {
				updatedSummary.legStatus = true;
				updatedSummary.comp[key] = "correct";
				continue ;
			}
			if (updatedSummary.comp[key] !== "incorrect")	{
				updateAttribute(updatedSummary, guess.card, key);
			}
		}
		return updatedSummary;
	}

	return (
	<main>

		<h1>MagicDLE</h1>
		<h2>Classic mode</h2>
		<section>
			{loading ? (<p>Loading cards...</p>) :
			guesses.length === 0 ? (
				<div>
					<GuessInput input={input} setInput={setInput} submitFunc={handleSubmit}/>
				</div>
			) : null}
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
									<td className="p-2">
									<AttributeCell
										value={summary.manaLow} value2={summary.manaHigh}
										comp={summary.comp["manaValue"]}
										delay={400 * 0} lastGuess/>
									</td>
									<td className="p-2">
									<AttributeCell
										value={summary.colorIdentity}
										comp={summary.comp["colorIdentity"]}
										delay={400 * 1} />
									</td>
									<td className="p-2">
									<AttributeCell
										value={summary.types}
										comp={summary.comp["types"]}
										delay={400 * 2} />
									</td>
									<td className="p-2">
									<AttributeCell
										value={summary.powerLow} value2={summary.powerHigh}
										comp={summary.comp["power"]}
										delay={400 * 3} />
									</td>
									<td className="p-2">
									<AttributeCell
										value={summary.toughnessLow} value2={summary.toughnessHigh}
										comp={summary.comp["toughness"]}
										delay={400 * 4} />
									</td>
									<td className="p-2">
									<AttributeCell
										value={summary.legStatus}
										comp={summary.comp["legStatus"]}
										delay={400 * 5} />
									</td>
									<td className="p-2">
									<AttributeCell
										value={summary.rarity}
										comp={summary.comp["rarity"]}
										delay={400 * 6} />
									</td>
									<td className="p-2">
									<AttributeCell
										value={summary.releaseYearLow} value2={summary.releaseYearHigh}
										value3={summary.set}
										comp={summary.comp["releaseYear"]} comp2={summary.comp["set"]}
										delay={400 * 7} />
									</td>
									</tr>
								</tbody>
							</table>
						</div>)
					}

					<table className="table-auto">
						<thead>
							<tr key="attributesName">
								<th key="empty" className="p-3"></th>
								<th key="mana" className="p-3">Mana</th>
								<th key="color" className="p-3">Color</th>
								<th key="types" className="p-3">Types</th>
								<th key="power" className="p-3">Power</th>
								<th key="toughness" className="p-3">Toughness</th>
								<th key="legendary" className="p-3">Legendary</th>
								<th key="rarity" className="p-3">Rarity</th>
								<th key="set" className="p-3">Set</th>
							</tr>
						</thead>
						<tbody>
							{guesses.toReversed().map((guess, index) => {
								const isLastGuess = index === 0;
								const card = {
										manaValue: guess.card.manaValue,
										colorIdentity: guess.card.colorIdentity,
										types: guess.card.types,
										power: guess.card.power,
										toughness: guess.card.toughness,
										legStatus: guess.card.legStatus,
										rarity: guess.card.rarity,
										set: guess.card.set
								}

								return (
								<tr key={guess.card.name}>
									<td className="p-2">{guess.card.name}</td>
									{Object.entries(card).map(([name, value], i) => {
										return (
											<td key={name} className="p-2">
												{name === "set" ? (
													<AttributeCell 
														value={guess.card.releaseYear}
														value3={guess.card.set}
														comp={guess.comp["releaseYear"]} comp2={guess.comp[name]} lastGuess={isLastGuess}
														delay={400 * i} />
												) : (
													<AttributeCell value={value} comp={guess.comp[name]} lastGuess={isLastGuess} delay={400 * i} />
												)}
											</td>
										);
									})}
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
