import type { SummaryEntity } from "./types/game";

const defaultSummary: SummaryEntity = {
	legStatus: false,
	comp: {
		"manaValue": "incorrect",
		"colorIdentity": "incorrect",
		"types": "incorrect",
		"subtypes": "incorrect",
		"power": "incorrect",
		"toughness": "incorrect",
    "legStatus": "incorrect",
		"rarity": "incorrect",
		"releaseSet": "incorrect",
		"releaseYear": "incorrect"
	}
};

export function getSummaryEntity(): SummaryEntity {
  const summary = localStorage.getItem("summary");
  if (!summary) {
    return defaultSummary;
  }
  
  try {
    return JSON.parse(summary) as SummaryEntity;
  } catch {
    console.error("Error while parsing cached summary");
    return defaultSummary;
  }
}

export function setSummaryEntity(summary: SummaryEntity) {
  localStorage.setItem("summary", JSON.stringify(summary));
}