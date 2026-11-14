import express from 'express';

import gameRoutes from './routes/gameRoutes.ts'
import authRoutes from './routes/authRoutes.ts'
import oauthRoutes from './routes/oauthRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import healthRoutes from './routes/healthRoutes.ts'
import metricsRoutes from './routes/metricsRoutes.ts'
import metricsMiddleware from './middleware/metricsMiddleware.ts'

import requireAuth from './middleware/authMiddleware.ts'
import errorCatcher from './middleware/errorMiddleware.ts'

import cookieParser from 'cookie-parser'

import { mkdirSync } from 'node:fs'
import path from 'node:path'

export const UPLOADS_DIR = path.resolve("uploads")
mkdirSync(path.join(UPLOADS_DIR, "avatars"), { recursive: true })   // no-op if it already exists

const app = express();
app.disable('x-powered-by');

app.use(metricsMiddleware)
app.use(express.json())
app.use(cookieParser());

app.use("/uploads", express.static(UPLOADS_DIR, {
  index: false,                  // no directory listings
  fallthrough: false,            // a missing file is a 404, not the next route
  maxAge: "1y", immutable: true, // safe: every new avatar gets a new random name
  setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
}))

// Public endpoints

app.use("/auth", authRoutes)
app.use("/auth", oauthRoutes)
app.use("/health", healthRoutes)

app.use(requireAuth);
app.use("/dle", gameRoutes)

// sensitive endpoints : require a valid session

app.use("/users", userRoutes)

app.use(errorCatcher);

app.listen(5003, () => {
    console.log("server running");
});

// Metrics are served on a separate port, reachable only from the Docker network
const metricsApp = express()
metricsApp.use("/metrics", metricsRoutes)
metricsApp.listen(9100)
