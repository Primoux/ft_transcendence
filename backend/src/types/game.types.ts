export type GuessEntity = {
	id: string,
	name: string,
	art: string
};

export type Colors =
	"White" |
	"Black" |
	"Blue" | 
	"Green" |
	"Red" |
	"None"
;

export type Rarity = 
	"Common" |
	"Uncommon" |
	"Rare" |
	"Mythic"
;

export type CardEntity = {
	id: string,
	name: string,
	art: string,
	mana_cost: number,
	colors: Colors[],
	types: string[],
	power?: number,
	toughness?: number,
	is_leg: boolean,
	rarity: Rarity,
	set: string,
	year: number
}

export type AttributeStatus =
	"correct" |
	"incorrect" |
	"partially" |
	"higher" |
	"lower"
;

export type GuessResult = {
	win: boolean;
	full_card?: string,
	card: CardEntity;
	comp: Record<string, AttributeStatus>
};