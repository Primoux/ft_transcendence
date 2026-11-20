import express from 'express';
import { createServer } from 'http'
import { Server } from 'socket.io';

import gameRoutes from './routes/gameRoutes.ts'
import authRoutes from './routes/authRoutes.ts'
import oauthRoutes from './routes/oauthRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import healthRoutes from './routes/healthRoutes.ts'
import metricsRoutes from './routes/metricsRoutes.ts'
import twoFactorRoutes from './routes/twoFactorRoutes.ts'
import confirmEmailRoutes from './routes/confirmEmailRoutes.ts'
import metricsMiddleware from './middleware/metricsMiddleware.ts'

import requireAuth, { requireVerifiedEmail } from './middleware/authMiddleware.ts'
import errorCatcher from './middleware/errorMiddleware.ts'

import cookieParser from 'cookie-parser'

import { UPLOADS_DIR } from './services/avatars.ts'
import { startCleanupJob } from './services/cleanup.ts';


const app = express();
app.disable('x-powered-by');
const server = createServer(app); 
export const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

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

// sensitive endpoints : require a valid session
app.use(requireAuth);

app.use("/users", userRoutes)
app.use("/auth", confirmEmailRoutes)

app.use(requireVerifiedEmail)
app.use("/dle", gameRoutes)
app.use("/auth/2fa", twoFactorRoutes)

// No route matched: answer in JSON like every other response, instead of Express's HTML page.
app.use((req, res) => {
    res.status(404).json({ error: "not found" })
})

app.use(errorCatcher);

startCleanupJob()

io.on('connection', (socket) => {
    console.log('a user connected: ', socket.id);
    
    socket.on('disconnect', (reason) => {
        console.log('a user disconnected: ', socket.id);
        console.log('reason: ', reason);
    });
});

server.listen(5003, () => {
    console.log("server running");
});

// Metrics are served on a separate port, reachable only from the Docker network
const metricsApp = express()
metricsApp.use("/metrics", metricsRoutes)
metricsApp.listen(9100)
