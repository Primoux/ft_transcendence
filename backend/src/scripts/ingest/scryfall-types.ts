export type ScryfallBulkType =
  | "default_cards"
  | "all_cards"
  | "unique_artwork"
  | "oracle_cards"
  | "oracle_tags"
  | "rulings"
  | "art_tags";

export interface ScryfallOracleCard {
  oracle_id: string;
  id: string;
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
  oracle_id: string;
  released_at: Date;
  set: string;
  set_name: string;
}
