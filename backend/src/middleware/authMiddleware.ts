import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

function logger(req: Request, res: Response, next: NextFunction) {
    console.log(req.method, req.url);
    next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
    console.log('Cookies: ', req.cookies);
    const token = req.cookies.token

    if (!token) {
        return res.status(401).send("No token provided")
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
export default requireAuth