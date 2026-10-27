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
