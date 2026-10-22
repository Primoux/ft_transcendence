type AttributeValue = string | number | string[];

export type CardEntity = {
	id: number,
	name: string;
	attributes: Record<string, AttributeValue>;
};

export type AttributeStatus =
	"correct" |
	"incorrect" |
	"partially" |
	"higher" |
	"lower"
;

type AttributeResult = {
	value: AttributeValue,
	status: AttributeStatus
}

export type GuessResult = {
	name: string;
	win: boolean;
	attributes: Record<string, AttributeResult>;
};

export type GuessEntity = {
	id: string,
	name: string,
	image: string
};