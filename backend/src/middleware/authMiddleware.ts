import type { Request, Response, NextFunction } from "express";
import { SESSION_COOKIE, authRepository } from "../data/repositories/auth.repository.ts";

function logger(req: Request, res: Response, next: NextFunction) {
    console.log(req.method, req.url);
    next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const session = await authRepository.validateSession(token);
  if (!session) {
    authRepository.clearSessionCookie(res);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  req.userId = session.userId;
  req.sessionId = session.id;
  next();
}

export default requireAuth