import express from 'express';

import gameRoutes from './routes/gameRoutes'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import healthRoutes from './routes/healthRoutes'

import requireAuth from './middleware/authMiddleware'
import errorCatcher from './middleware/errorMiddleware'

import cookieParser from 'cookie-parser'

const app = express();
app.disable('x-powered-by');

app.use(express.json())
app.use(cookieParser());

// Public endpoints

app.use("/", gameRoutes)
app.use("/auth", authRoutes)
app.use("/health", healthRoutes)

app.use(requireAuth);

// sensitive endpoints : require valid jwt

app.use("/users", userRoutes)

app.use(errorCatcher);

app.listen(5003, () => {
    console.log("server running");
});
