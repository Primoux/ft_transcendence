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

export function shouldKeepCard(rawCard: any): boolean {
  return (
    !EXCLUDED_LAYOUTS.has(rawCard.layout) &&
    rawCard.set_type !== "funny" &&
    !rawCard.digital &&
    !rawCard.reprint
  );
}
