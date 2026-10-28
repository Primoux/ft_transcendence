import express from 'express'
import { collectDefaultMetrics, Gauge, register } from "@prometheus-io/client"
import { prisma } from '../data/prisma';

const router = express.Router()
collectDefaultMetrics()

new Gauge({
  name: 'mtgdle_users_total',
  help: 'Number of registered users',
  async collect() {
    this.set(await prisma.user.count())
  },
});

router.get("/", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

export default router
