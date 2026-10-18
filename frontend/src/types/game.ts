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
	attributes: Record<string, AttributeResult>;
};