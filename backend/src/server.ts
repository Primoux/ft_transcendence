import express from 'express';
import { createServer } from 'http'
import { Server } from 'socket.io';

import gameRoutes from './routes/gameRoutes.ts'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import healthRoutes from './routes/healthRoutes.ts'
import metricsRoutes from './routes/metricsRoutes.ts'
import metricsMiddleware from './middleware/metricsMiddleware.ts'

import requireAuth from './middleware/authMiddleware.ts'
import errorCatcher from './middleware/errorMiddleware.ts'

import cookieParser from 'cookie-parser'

const app = express();
app.disable('x-powered-by');
const server = createServer(app); 
const io = new Server(server, {
    cors: {
        // origin: 'http://localhost:5173', // dev
        // origin: 'https://localhost:8443', // prod
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

app.use(metricsMiddleware)
app.use(express.json())
app.use(cookieParser());

// Public endpoints

app.use("/auth", authRoutes)
app.use("/health", healthRoutes)

app.use(requireAuth);
app.use("/dle", gameRoutes)

// sensitive endpoints : require valid jwt

app.use("/users", userRoutes)

app.use(errorCatcher);

// app.listen(5003, () => {
//     console.log("server running");
// });

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
