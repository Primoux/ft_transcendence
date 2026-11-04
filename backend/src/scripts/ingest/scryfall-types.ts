export const SCRYFALL_BULK_TYPES = {
  ORACLE: "oracle_cards",
  DEFAULT: "default_cards",
  ALL_CARDS: "all_cards",
  UNIQUE_ARTWORK: "unique_artwork",
  ORACLE_TAGS: "oracle_tags",
  RULINGS: "rulings",
  ART_TAGS: "art_tags",
} as const;

export type ScryfallBulkType =
  (typeof SCRYFALL_BULK_TYPES)[keyof typeof SCRYFALL_BULK_TYPES];

export interface ScryfallOracleCard {
  oracle_id: string;
  edhrec_rank?: number;
  image_uris?: {
    normal?: string;
    art_crop?: string;
  };
  name: string;
  cmc: number;
  type_line?: string;
  color_identity: string[];
  power?: string;
  toughness?: string;
  rarity: string;
  layout: string;
  set_type: string;
  digital: boolean;
}

export type ValidScryfallOracleCard = ScryfallOracleCard & {
  type_line: string;
  image_uris: {
    normal: string;
    art_crop: string;
  };
};

export interface ScryfallCardHistory {
  id: string;
  oracle_id?: string;
  released_at: Date;
  set: string;
  set_name: string;
}

export type ValidScryfallCardHistory = ScryfallCardHistory & {
  oracle_id: string;
};
