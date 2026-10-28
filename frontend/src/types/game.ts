/** for searching */
export interface Entity {
	id: string;
	name: string;
};

/** for guesses */
type AttributeValue = string | number | string[] | number[];

export type AttributeResult =
	"correct" |
	"incorrect" |
	"partially" |
	"higher" |
	"lower"
;

export type GuessResult = {
	name: string;
	win: boolean;
	attributes: Record<string, AttributeValue>;
	comparison: Record<string, AttributeResult>;
};

/** for caching */ 
export interface GameState {
	gameId: string; //? probably date
	guesses: string[];
	won: boolean;
	updatedAt: number //? to delete
};

export interface LocalGameStorage {
	version: 1;
	games: Record<string, GameState>;
}
