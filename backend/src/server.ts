import express from 'express';

import gameRoutes from './routes/gameRoutes.ts'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import healthRoutes from './routes/healthRoutes.ts'
import metricsRoutes, { metricsMiddleware } from './routes/metricsRoutes.ts'

import requireAuth from './middleware/authMiddleware.ts'
import errorCatcher from './middleware/errorMiddleware.ts'

import cookieParser from 'cookie-parser'

const app = express();
app.disable('x-powered-by');

app.use(metricsMiddleware)
app.use(express.json())
app.use(cookieParser());

// Public endpoints

app.use("/dle", gameRoutes)
app.use("/auth", authRoutes)
app.use("/health", healthRoutes)
app.use("/metrics", metricsRoutes)

app.use(requireAuth);

// sensitive endpoints : require valid jwt

app.use("/users", userRoutes)

app.use(errorCatcher);

app.listen(5003, () => {
    console.log("server running");
});
