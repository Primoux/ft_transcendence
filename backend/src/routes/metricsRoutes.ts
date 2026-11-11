import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  register,
} from "@prometheus-io/client";
import express from "express";
import { GameMode, GameStatus, Rarity } from "../../generated/client.ts";
import {
  gameSessionRepository,
  userRepository,
  guessRepository,
  cardRepository,
  scryfallSyncRepository,
  dailyGameRepository
} from "../data/repositories/index.ts";

const router = express.Router();
collectDefaultMetrics(); // collect default metrics like process_cpu_user_seconds_total, process_resident_memory_bytes, etc.

const ACTIVE_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
export const lastSeen = new Map<string, number>(); // userId -> last seen timestamp

// a failing query must not break the whole /metrics endpoint
async function safe(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (err) {
    console.error("metrics collect failed:", err);
  }
}

// ---- HTTP ----

export const httpRequests = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

export const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"],
});

// ---- Users ----

new Gauge({
  name: "mtgdle_users_total",
  help: "Number of registered users",
  async collect() {
    await safe(async () => {
      this.set(await userRepository.countAll());
    });
  },
});

new Gauge({
  name: "mtgdle_active_users",
  help: "Users seen in the last 15 minutes",
  collect() {
    const limit = Date.now() - ACTIVE_WINDOW;
    for (const [userId, time] of lastSeen) {
      if (time < limit) lastSeen.delete(userId);
    }
    this.set(lastSeen.size);
  },
});

new Gauge({
  name: "mtgdle_private_users_total",
  help: "Number of users with a private profile",
  async collect() {
    await safe(async () => {
      this.set(await userRepository.countByPrivateStatus(true));
    });
  },
});

// ---- Games ----

new Gauge({
  name: "mtgdle_game_sessions",
  help: "Number of game sessions per status",
  labelNames: ["status"],
  async collect() {
    await safe(async () => {
      const rows = await gameSessionRepository.countByStatus();
      for (const status of Object.values(GameStatus)) this.set({ status }, 0);
      for (const row of rows) this.set({ status: row.status }, row._count);
    });
  },
});

new Gauge({
  name: "mtgdle_sessions_today",
  help: "Number of game sessions started today",
  async collect() {
    await safe(async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      this.set(await gameSessionRepository.countSince(startOfToday));
    });
  },
});

new Gauge({
  name: "mtgdle_guesses_stored_total",
  help: "Number of guesses stored in the database",
  async collect() {
    await safe(async () => {
      this.set(await guessRepository.countAll());
    });
  },
});

new Gauge({
  name: "mtgdle_daily_games",
  help: "Number of daily games generated per mode",
  labelNames: ["mode"],
  async collect() {
    await safe(async () => {
      const rows = await dailyGameRepository.countByMode();
      for (const mode of Object.values(GameMode)) this.set({ mode }, 0);
      for (const row of rows) this.set({ mode: row.mode }, row._count);
    });
  },
});

// ---- Cards ----

new Gauge({
  name: "mtgdle_cards_total",
  help: "Number of cards in the database",
  async collect() {
    await safe(async () => {
      this.set(await cardRepository.countAll());
    });
  },
});

new Gauge({
  name: "mtgdle_cards_by_rarity",
  help: "Number of cards per rarity",
  labelNames: ["rarity"],
  async collect() {
    await safe(async () => {
      const rows = await cardRepository.countByRarity();
      for (const rarity of Object.values(Rarity)) this.set({ rarity }, 0);
      for (const row of rows) this.set({ rarity: row.rarity }, row._count);
    });
  },
});

// ---- Scryfall sync ----

// This metric tracks the last time the Scryfall sync was run for each key (e.g. "default", "custom").
new Gauge({
  name: "mtgdle_card_sync_last_timestamp_seconds",
  help: "Unix time of the last Scryfall sync",
  labelNames: ["key"],
  async collect() {
    await safe(async () => {
      const rows = await scryfallSyncRepository.findAll();
      this.reset();
      for (const row of rows)
        this.set({ key: row.key }, row.lastSyncAt.getTime() / 1000);
    });
  },
});

router.get("/", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export default router;
