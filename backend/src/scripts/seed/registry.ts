import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  achievementRepository,
  cardRepository,
  userRepository,
} from "../../data/repositories/index.ts";
import { Rarity, Color } from "../../../generated/client.ts";

export const registry = {
  // The password is generated here and only ever shown once, in the logs of the first startup:
  // the database keeps the hash, nothing keeps the clear text.
  async owner() {
    const username = process.env.OWNER_USERNAME?.toLowerCase();
    if (!username) {
      console.log("OWNER_USERNAME not set: no owner account created.");
      return;
    }
    if (await userRepository.findByUsername(username)) return;

    const password = randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(password, 10);
    await userRepository.create({ username, passwordHash, role: "OWNER" });
    console.log(`Owner account created: username "${username}", password "${password}"`);
  },
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
          "https://cards.scryfall.io/normal/front/4/f/4f616706-ec97-4923-bb1e-11a69fbaa1f8.jpg?1783909630",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/4/f/4f616706-ec97-4923-bb1e-11a69fbaa1f8.jpg?1783909630",
        edhrecRank: 10,
      },
      {
        oracleId: "6ad8011d-3471-4369-9d68-b264cc027487",
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
          "https://cards.scryfall.io/normal/front/f/c/fc817e07-c1f3-469f-9cf7-0945dea7400f.jpg?1793021181",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/f/c/fc817e07-c1f3-469f-9cf7-0945dea7400f.jpg?1793021181",
        edhrecRank: 1,
      },
      {
        oracleId: "550c74d4-1fcb-406a-b02a-639a760a4380",
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
          "https://cards.scryfall.io/normal/front/2/3/2398892d-28e9-4009-81ec-0d544af79d2b.jpg?1783939333",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/2/3/2398892d-28e9-4009-81ec-0d544af79d2b.jpg?1783939333",
        edhrecRank: 15000,
      },
      {
        oracleId: "d3a0b660-358c-41bd-9cd2-41fbf3491b1a",
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
          "https://cards.scryfall.io/normal/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.jpg?1783903230",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.jpg?1783903230",
        edhrecRank: 12,
      },
      {
        oracleId: "45900b2f-f6a9-4c42-9642-008f3c1cf6dd",
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
          "https://cards.scryfall.io/normal/front/8/b/8be5ee47-8f8a-4e3c-b1a1-9ca0e1fdec7f.jpg?1789127270",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/8/b/8be5ee47-8f8a-4e3c-b1a1-9ca0e1fdec7f.jpg?1789127270",
        edhrecRank: 3500,
      },
      {
        oracleId: "82004860-e589-4e38-8d61-8c0210e4ea39",
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
          "https://cards.scryfall.io/normal/front/a/2/a24b4cb6-cebb-428b-8654-74347a6a8d63.jpg?1783915679",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/a/2/a24b4cb6-cebb-428b-8654-74347a6a8d63.jpg?1783915679",
        edhrecRank: 2,
      },
      {
        oracleId: "956381ba-6d37-4a8a-846c-bad79222dbee",
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
          "https://cards.scryfall.io/normal/front/8/9/89f612d6-7c59-4a7b-a87d-45f789e88ba5.jpg?1789015964",
        artUrl:
          "https://cards.scryfall.io/art_crop/front/8/9/89f612d6-7c59-4a7b-a87d-45f789e88ba5.jpg?1789015964",
        edhrecRank: 300,
      },
    ];

    for (const card of cards) {
      await cardRepository.upsert(card);
    }
  },
};
