import express from 'express'
import { collectDefaultMetrics, register } from "@prometheus-io/client"

const router = express.Router()
collectDefaultMetrics()

router.get("/", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

export default router
