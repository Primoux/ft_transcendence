import type { GuessEntity } from "../../types/game";
import { useState, useEffect, useMemo, useRef } from "react";

interface IGuessInput {
  input: string;
  setInput: (value: string) => void;
  submitFunc: (event: React.FormEvent<HTMLFormElement>, name?: string) => void;
  cards: GuessEntity[];
  guessed: string[];
}

function GuessInput({input, setInput, submitFunc, cards, guessed} : IGuessInput) {
	const [delayInput, setDelayInput] = useState("");
	const [listIndex, setListIndex] = useState(-1);
	const listRef = useRef<HTMLUListElement>(null);

	const cleanInput = (str: string) =>
		str.trim().toLowerCase().replace(/,\s*/g, " ");
	
	const filtered = useMemo(() => {
		return cards.filter((card) => !guessed.includes(card.name))
			.filter((card) => 
				cleanInput(delayInput).length > 3
				? cleanInput(card.name).includes(cleanInput(delayInput))
				: cleanInput(card.name).startsWith(cleanInput(delayInput)));
	}, [cards, guessed, delayInput]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDelayInput(input);
			setListIndex(-1);
		}, 300);
		return () => clearTimeout(timeout);
	}, [input]);

	useEffect(() => {
		if (listIndex < 0) {
			return ;
		}
		const listFocus = listRef.current?.children[listIndex];

		listFocus?.scrollIntoView({
			block: "nearest",
			behavior: "smooth"
		});
	}, [listIndex]);

	function handleKeyboardInput(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			// if (listIndex <= 0) {
			// 	setListIndex((prev: number) => prev + 1);
			// 	return ;
			// }
			setListIndex((prev: number) => Math.min(prev + 1, filtered.length - 1));
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			if (listIndex < 0) {
				return ;
			}
			setListIndex((prev: number) => Math.max(prev - 1, 0));
		}
		if (event.key === "Enter") {
			event.preventDefault();
			if (listIndex < 0 || !filtered[listIndex]) {
				return;
			}
			setInput(filtered[listIndex].name);
			console.log(filtered[listIndex].name);
			// event.currentTarget.form?.requestSubmit();
			submitFunc(
				event as unknown as React.FormEvent<HTMLFormElement>,
				filtered[listIndex].name
			);
			setListIndex(-1);
		}
		if  (event.key === "Escape") {
			event.preventDefault();
			setListIndex(-1);
			setDelayInput("");
		}
	}

	function handleMouseInput(event: React.MouseEvent<HTMLInputElement>, card: GuessEntity | string) {
		event.preventDefault();
		if (typeof card !== "string") {
			setInput(card.name);
		}
		submitFunc(
			event as unknown as React.FormEvent<HTMLFormElement>,
			filtered[listIndex].name
		);
		// setDelayInput(card.name);
		setListIndex(-1);
	}

	return (
		<form onSubmit={submitFunc}>
			<input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Enter card name..."
				onKeyDown={handleKeyboardInput}
				autoFocus
			/>
			<button type="submit" onMouseDown={e => handleMouseInput(e, input)}>Guess</button>
			<ul className="max-h-60 min-w-60 overflow-y-auto" ref={listRef}>
			{delayInput.trim().length > 0 && (
				filtered.map((card, index) => (
					<li key={card.id} className={`flex items-center gap-2 h-8 ${listIndex === index ? "bg-blue-300" : ""}`}
						onMouseEnter={() => setListIndex(index)} onMouseDown={e => handleMouseInput(e, card)}
					>
						<img className="w-8" src={card.artUrl}/>{card.name}
					</li>
				))
			)}
			</ul>
		</form>
  );
}

export default GuessInput;