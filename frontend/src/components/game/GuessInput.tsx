interface IGuessInput {
  input: string;
  setInput: (value: string) => void;
  submitFunc: (event: React.FormEvent<HTMLFormElement>) => void;
}


function GuessInput({input, setInput, submitFunc} : IGuessInput) {

  return (
    <form onSubmit={submitFunc}>
			<input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Enter card name..."
				autoFocus
			/>
			<button type="submit">Guess</button>
		</form>
  );
}

export default GuessInput;