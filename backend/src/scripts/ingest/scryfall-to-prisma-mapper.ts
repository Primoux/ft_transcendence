import { Color, Rarity, type Prisma } from "@prisma/client";
import type {
  ScryfallCardHistory,
  ValidScryfallOracleCard,
} from "./scryfall-types";

const SUPERTYPES = new Set(["Basic", "Legendary", "Ongoing", "Snow", "World"]);

const COLOR_RECORD: Record<string, Color> = {
  W: Color.WHITE,
  U: Color.BLUE,
  B: Color.BLACK,
  R: Color.RED,
  G: Color.GREEN,
  C: Color.COLORLESS,
} as const;

const RARITY_RECORD: Record<string, Rarity> = {
  common: Rarity.COMMON,
  uncommon: Rarity.UNCOMMON,
  rare: Rarity.RARE,
  mythic: Rarity.MYTHIC,
  special: Rarity.SPECIAL,
  bonus: Rarity.BONUS,
} as const;

interface ParsedTypeLine {
  supertypes: string[];
  types: string[];
  subtypes: string[];
}

export const cardMapper = {
  toStagingOracle(oracleCard: ValidScryfallOracleCard): Prisma.StagingOracleCardCreateManyInput {
    const { supertypes, types, subtypes } = parseTypeLine(oracleCard.type_line);

    return {
      oracleId: oracleCard.oracle_id,
      edhrecRank: oracleCard.edhrec_rank ?? null,
      imageUrl: oracleCard.image_uris.normal,
      artUrl: oracleCard.image_uris.art_crop,
      name: oracleCard.name,
      manaValue: oracleCard.cmc,
      types,
      supertypes,
      subtypes,
      colorIdentity: parseColorIdentity(oracleCard.color_identity),
      power: oracleCard.power ?? null,
      toughness: oracleCard.toughness ?? null,
      rarity: RARITY_RECORD[oracleCard.rarity]
    };
  },

  toStagingHistory(cardHistory: ScryfallCardHistory): Prisma.StagingCardHistoryCreateManyInput {
    return {
      oracleId: cardHistory.oracle_id,
      releaseDate: new Date(cardHistory.released_at),
      releaseSet: cardHistory.set,
      releaseSetName: cardHistory.set_name,
    };
  },
};

function parseTypeLine(typeLine: string): ParsedTypeLine {
  const [rawMain, rawSub] = typeLine.split("—");
  const mainTypesPart = rawMain?.trim();
  const subtypesPart = rawSub?.trim();

  const supertypes: string[] = [];
  const types: string[] = [];
  const subtypes: string[] = subtypesPart ? subtypesPart.split(" ") : [];

  if (mainTypesPart) {
    const unfilteredTypes = mainTypesPart.split(" ");
    for (const type of unfilteredTypes) {
      if (SUPERTYPES.has(type)) {
        supertypes.push(type);
      } else {
        types.push(type);
      }
    }
  }

  return { supertypes, types, subtypes };
}

export function parseColorIdentity(rawColors: string[]): Color[] {
  return rawColors.map((color) => COLOR_RECORD[color]);
}
