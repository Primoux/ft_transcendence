export type GuessEntity = {
	id: string,
	name: string,
	artUrl: string
};

export type ColorIdentity =
	"White" |
	"Black" |
	"Blue" | 
	"Green" |
	"Red" |
	"Colorless"
;

export type Rarity = 
	"Common" |
	"Uncommon" |
	"Rare" |
	"Mythic" |
	"Special" |
	"Bonus"
;

export type CardEntity = {
	id: string,
	name: string,
	artUrl: string,
	manaValue: number,
	colorIdentity: ColorIdentity[],
	types: string[],
	power?: number,
	toughness?: number,
	legStatus: boolean,
	rarity: Rarity,
	set: string,
	releaseYear: number
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
	fullCardUrl?: string,
	card: CardEntity;
	comp: Record<string, AttributeStatus>
};