import {
  achievementRepository,
  cardRepository,
} from "../../data/repositories/index.ts";
import { Rarity, Color } from "../../../generated/client.ts";

export const registry = {
  async achievements() {
    const achievements = [
      {
        id: "first_win",
        title: "First win",
        description: "Win your first game",
        icon: "path",
      },
    ];

    for (const achievement of achievements) {
      await achievementRepository.upsert(achievement);
    }
  },
  async magicCards() {
    const cards = [
      {
        oracleId: "c186835d-9af2-4b24-a4f6-c5c567840b9b",
        name: "Black Lotus",
        manaValue: 0,
        types: ["Artifact"],
        supertypes: [],
        subtypes: [],
        colorIdentity: [],
        power: null,
        toughness: null,
        rarity: Rarity.RARE,
        releaseDate: new Date("1993-08-05"),
        releaseSet: "lea",
        releaseSetName: "Limited Edition Alpha",
        imageUrl:
          "https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg",
        edhrecRank: 1200,
      },
      {
        oracleId: "67584666-88fb-47ea-a2fb-6d87131a4781",
        name: "Lightning Bolt",
        manaValue: 1,
        types: ["Instant"],
        supertypes: [],
        subtypes: [],
        colorIdentity: [Color.RED],
        power: null,
        toughness: null,
        rarity: Rarity.COMMON,
        releaseDate: new Date("1993-08-05"),
        releaseSet: "lea",
        releaseSetName: "Limited Edition Alpha",
        imageUrl:
          "https://cards.scryfall.io/normal/front/e/3/e3285e6b-3e79-4d7c-bf96-d920f973b122.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/e/3/e3285e6b-3e79-4d7c-bf96-d920f973b122.jpg",
        edhrecRank: 5,
      },
      {
        oracleId: "6b3f745e-49fa-4e0e-8ea2-1f5be6cb7de0",
        name: "Counterspell",
        manaValue: 2,
        types: ["Instant"],
        supertypes: [],
        subtypes: [],
        colorIdentity: [Color.BLUE],
        power: null,
        toughness: null,
        rarity: Rarity.UNCOMMON,
        releaseDate: new Date("1993-08-05"),
        releaseSet: "lea",
        releaseSetName: "Limited Edition Alpha",
        imageUrl:
          "https://cards.scryfall.io/normal/front/c/5/c54508cf-255d-4f13-b541-ddf571348b48.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/c/5/c54508cf-255d-4f13-b541-ddf571348b48.jpg",
        edhrecRank: 10,
      },
      {
        oracleId: "24c251d5-bc4e-4f51-8cf9-c3017a6a4e1e",
        name: "Sol Ring",
        manaValue: 1,
        types: ["Artifact"],
        supertypes: [],
        subtypes: [],
        colorIdentity: [],
        power: null,
        toughness: null,
        rarity: Rarity.UNCOMMON,
        releaseDate: new Date("1993-08-05"),
        releaseSet: "lea",
        releaseSetName: "Limited Edition Alpha",
        imageUrl:
          "https://cards.scryfall.io/normal/front/c/a/caec9815-4afb-49d9-bb43-7f897f26c6d0.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/c/a/caec9815-4afb-49d9-bb43-7f897f26c6d0.jpg",
        edhrecRank: 1,
      },
      {
        oracleId: "f0d2d3e2-8924-42b7-a35b-17937409cd8b",
        name: "Ancestral Recall",
        manaValue: 1,
        types: ["Instant"],
        supertypes: [],
        subtypes: [],
        colorIdentity: [Color.BLUE],
        power: null,
        toughness: null,
        rarity: Rarity.RARE,
        releaseDate: new Date("1993-08-05"),
        releaseSet: "lea",
        releaseSetName: "Limited Edition Alpha",
        imageUrl:
          "https://cards.scryfall.io/normal/front/2/f/2f3a61f3-e59e-4e64-9b57-c812908f51a4.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/2/f/2f3a61f3-e59e-4e64-9b57-c812908f51a4.jpg",
        edhrecRank: 15000,
      },
      {
        oracleId: "a5026ff8-3c3e-4ec6-8961-4c7b848c4cfb",
        name: "Birds of Paradise",
        manaValue: 1,
        types: ["Creature"],
        supertypes: [],
        subtypes: ["Bird", "Avatar"],
        colorIdentity: [Color.GREEN],
        power: "0",
        toughness: "1",
        rarity: Rarity.RARE,
        releaseDate: new Date("1993-08-05"),
        releaseSet: "lea",
        releaseSetName: "Limited Edition Alpha",
        imageUrl:
          "https://cards.scryfall.io/normal/front/f/e/feify0f9-2c70-4665-9851-93339f408990.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/f/e/feify0f9-2c70-4665-9851-93339f408990.jpg",
        edhrecRank: 12,
      },
      {
        oracleId: "8f74a813-fdfd-4299-92c2-805a8b7c4b31",
        name: "Tarmogoyf",
        manaValue: 2,
        types: ["Creature"],
        supertypes: [],
        subtypes: ["Lhurgoyf"],
        colorIdentity: [Color.GREEN],
        power: "*",
        toughness: "*+1",
        rarity: Rarity.RARE,
        releaseDate: new Date("2007-05-04"),
        releaseSet: "fut",
        releaseSetName: "Future Sight",
        imageUrl:
          "https://cards.scryfall.io/normal/front/4/2/42e56bc7-7098-406a-867c-6c1704944443.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/4/2/42e56bc7-7098-406a-867c-6c1704944443.jpg",
        edhrecRank: 3500,
      },
      {
        oracleId: "6a4a1599-2e1c-4b5c-a1c1-4c4f346b7a5a",
        name: "Jace, the Mind Sculptor",
        manaValue: 4,
        types: ["Planeswalker"],
        supertypes: ["Legendary"],
        subtypes: ["Jace"],
        colorIdentity: [Color.BLUE],
        power: null,
        toughness: null,
        rarity: Rarity.MYTHIC,
        releaseDate: new Date("2010-02-05"),
        releaseSet: "wwk",
        releaseSetName: "Worldwake",
        imageUrl:
          "https://cards.scryfall.io/normal/front/c/0/c0571d58-1392-4217-ac43-7f722a45d05c.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/c/0/c0571d58-1392-4217-ac43-7f722a45d05c.jpg",
        edhrecRank: 850,
      },
      {
        oracleId: "f467554f-124b-4b2a-a53c-1b777cf8977c",
        name: "Demonic Tutor",
        manaValue: 2,
        types: ["Sorcery"],
        supertypes: [],
        subtypes: [],
        colorIdentity: [Color.BLACK],
        power: null,
        toughness: null,
        rarity: Rarity.UNCOMMON,
        releaseDate: new Date("1993-08-05"),
        releaseSet: "lea",
        releaseSetName: "Limited Edition Alpha",
        imageUrl:
          "https://cards.scryfall.io/normal/front/3/b/3b763aa1-970e-4205-9d3w-50f9361a6b0c.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/3/b/3b763aa1-970e-4205-9d3w-50f9361a6b0c.jpg",
        edhrecRank: 2,
      },
      {
        oracleId: "0b0800b2-8411-4f1c-99d7-5674c1537b0b",
        name: "Force of Will",
        manaValue: 5,
        types: ["Instant"],
        supertypes: [],
        subtypes: [],
        colorIdentity: [Color.BLUE],
        power: null,
        toughness: null,
        rarity: Rarity.UNCOMMON,
        releaseDate: new Date("1996-06-10"),
        releaseSet: "all",
        releaseSetName: "Alliances",
        imageUrl:
          "https://cards.scryfall.io/normal/front/d/s/ds920f97-3b12-45ad-a2fb-6d87131a4782.jpg",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/d/s/ds920f97-3b12-45ad-a2fb-6d87131a4782.jpg",
        edhrecRank: 300,
      },
    ];

    for (const card of cards) {
      await cardRepository.upsert(card);
    }
  },
};
