<<<<<<< HEAD
import { Rarity, type Prisma } from "../../generated/client.ts";
=======
import { Rarity, type Prisma } from "@prisma/client";
>>>>>>> 6c310d9 (!feat(backend/scripts/): finish the ingestion script)

const SUPERTYPES = new Set(["Basic", "Legendary", "Ongoing", "Snow", "World"]);

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

const EXCLUDED_LAYOUTS = new Set([
  // Non-playable accessories and tokens
  "token",
  "double_faced_token",
  "emblem",
  "art_series",
  "front_card",

  // Alternative game formats & Un-sets
  "planar",
  "scheme",
  "vanguard",
  "augment",
  "host",

  // Double-faced cards
  "transform",
  "modal_dfc",
  "reversible_card",
]);

export function toPrismaCard(rawCard: any): Prisma.MagicCardCreateManyInput {
  const { supertypes, types, subtypes } = parseTypeLine(rawCard.type_line);

  return {
    id: rawCard.id,
    edhrecRank: rawCard.edhrec_rank ?? null,
    imageUrl: rawCard.image_uris?.normal ?? "",
    artUrl: rawCard.image_uris?.art_crop ?? "",
    name: rawCard.name,
    manaValue: rawCard.cmc,
    types,
    supertypes,
    subtypes,
    colorIdentity: rawCard.color_identity ?? [],
    power: rawCard.power ?? null,
    toughness: rawCard.toughness ?? null,
    extension: rawCard.set ?? "",
    rarity: RARITY_RECORD[rawCard.rarity],
    releaseDate: new Date(rawCard.released_at),
    releaseSet: rawCard.set_name ?? "",
  };
}

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
<<<<<<< HEAD
      } else {
=======
      } else if (type.length > 0) {
>>>>>>> 6c310d9 (!feat(backend/scripts/): finish the ingestion script)
        types.push(type);
      }
    }
  }

  return { supertypes, types, subtypes };
}

export function shouldKeepCard(rawCard: any): boolean {
  return (
<<<<<<< HEAD
    !EXCLUDED_LAYOUTS.has(rawCard.layout) &&
    rawCard.set_type !== "funny" &&
    !rawCard.reprint
=======
    !EXCLUDED_LAYOUTS.has(rawCard.layout) && !(rawCard.set_type === "funny")
>>>>>>> 6c310d9 (!feat(backend/scripts/): finish the ingestion script)
  );
}
