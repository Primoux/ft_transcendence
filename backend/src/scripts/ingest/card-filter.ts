import type { ScryfallOracleCard, ValidScryfallOracleCard } from "./scryfall-types";

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

export function shouldKeepCard(
  oracleCard: ScryfallOracleCard,
): oracleCard is ValidScryfallOracleCard {
  return (
    oracleCard.type_line !== undefined &&
    oracleCard.image_uris?.normal !== undefined &&
    oracleCard.image_uris?.art_crop !== undefined &&
    !EXCLUDED_LAYOUTS.has(oracleCard.layout) &&
    oracleCard.set_type !== "funny" &&
    !oracleCard.digital
  );
}
