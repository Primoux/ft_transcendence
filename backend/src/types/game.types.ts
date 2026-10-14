export type Entity = {
	id: number,
	name: string;
	attributes: Record<string, unknown>;
};

export type AttributeResult =
	"correct" |
	"incorrect" |
	"partially" |
	"higher" |
	"lower"
;

export type GuessResult = {
	id: number;
	win: boolean;
	attributes: Record<string, AttributeResult>;
};
