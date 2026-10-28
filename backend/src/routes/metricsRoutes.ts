import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { collectDefaultMetrics, Counter, Gauge, Histogram, register } from "@prometheus-io/client"
import { GameStatus, GameMode, Rarity } from '@prisma/client'
import { prisma } from '../data/prisma'

// requests on these paths are not measured
const IGNORED_PATHS = ['/health']

const router = express.Router()
collectDefaultMetrics()

// a failing query must not break the whole /metrics endpoint
async function safe(fn: () => Promise<void>) {
  try {
    await fn()
  } catch (err) {
    console.error("metrics collect failed:", err)
  }
}

// ---- HTTP ----

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
})

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
})

// ---- Middleware ----

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (IGNORED_PATHS.some((path) => req.path.startsWith(path)))
    return next()
  const end = httpDuration.startTimer()
  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : 'unmatched'
    httpRequests.inc({ method: req.method, route, status: res.statusCode })
    end({ method: req.method, route })
  })
  next()
}

// ---- Users ----

new Gauge({
  name: 'mtgdle_users_total',
  help: 'Number of registered users',
  async collect() {
    await safe(async () => {
      this.set(await prisma.user.count())
    })
  },
})

new Gauge({
  name: 'mtgdle_private_users_total',
  help: 'Number of users with a private profile',
  async collect() {
    await safe(async () => {
      this.set(await prisma.user.count({ where: { privateProfile: true } }))
    })
  },
})

// ---- Games ----

new Gauge({
  name: 'mtgdle_game_sessions',
  help: 'Number of game sessions per status',
  labelNames: ['status'],
  async collect() {
    await safe(async () => {
      const rows = await prisma.gameSession.groupBy({ by: ['status'], _count: true })
      for (const status of Object.values(GameStatus))
        this.set({ status }, 0)
      for (const row of rows)
        this.set({ status: row.status }, row._count)
    })
  },
})

new Gauge({
  name: 'mtgdle_sessions_today',
  help: 'Number of game sessions started today',
  async collect() {
    await safe(async () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      this.set(await prisma.gameSession.count({ where: { createdAt: { gte: start } } }))
    })
  },
})

new Gauge({
  name: 'mtgdle_guesses_stored_total',
  help: 'Number of guesses stored in the database',
  async collect() {
    await safe(async () => {
      this.set(await prisma.guess.count())
    })
  },
})

new Gauge({
  name: 'mtgdle_daily_games',
  help: 'Number of daily games generated per mode',
  labelNames: ['mode'],
  async collect() {
    await safe(async () => {
      const rows = await prisma.dailyGame.groupBy({ by: ['mode'], _count: true })
      for (const mode of Object.values(GameMode))
        this.set({ mode }, 0)
      for (const row of rows)
        this.set({ mode: row.mode }, row._count)
    })
  },
})

// ---- Cards ----

new Gauge({
  name: 'mtgdle_cards_total',
  help: 'Number of cards in the database',
  async collect() {
    await safe(async () => {
      this.set(await prisma.magicCard.count())
    })
  },
})

new Gauge({
  name: 'mtgdle_cards_by_rarity',
  help: 'Number of cards per rarity',
  labelNames: ['rarity'],
  async collect() {
    await safe(async () => {
      const rows = await prisma.magicCard.groupBy({ by: ['rarity'], _count: true })
      for (const rarity of Object.values(Rarity))
        this.set({ rarity }, 0)
      for (const row of rows)
        this.set({ rarity: row.rarity }, row._count)
    })
  },
})

new Gauge({
  name: 'mtgdle_card_sync_last_timestamp_seconds',
  help: 'Unix time of the last Scryfall sync',
  labelNames: ['key'],
  async collect() {
    await safe(async () => {
      const rows = await prisma.cardSync.findMany()
      this.reset()
      for (const row of rows)
        this.set({ key: row.key }, row.lastSyncAt.getTime() / 1000)
    })
  },
})

router.get("/", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

export default router
