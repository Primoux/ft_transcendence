import type { Request, Response, NextFunction } from "express";
import { SESSION_COOKIE, authRepository } from "../data/repositories/auth.repository.ts";
import { userRepository } from "../data/repositories/user.repository.ts";

const UNVERIFIED_EMAIL_ERROR = "EMAIL_UNVERIFIED"
const NOT_AUTHENTICATED_ERROR = "UNAUTHENTICATED"
const INVALID_SESSION_ERROR = "INVALID_SESSION"
const NO_SUCH_USER_ERROR = "NO_SUCH_USER"

function logger(req: Request, res: Response, next: NextFunction) {
    console.log(req.method, req.url);
    next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) {
    return res.status(401).json({ code: NOT_AUTHENTICATED_ERROR, error: "Not authenticated"});
  }
  const session = await authRepository.validateSession(token);
  if (!session) {
    authRepository.clearSessionCookie(res);
    return res.status(401).json({ code: INVALID_SESSION_ERROR, error: "Invalid or expired session" });
  }
  req.userId = session.userId;
  req.sessionId = session.id;
  next();
}

export async function requireVerifiedEmail(req: Request, res: Response, next: NextFunction) {
  if (!req.userId)
    return res.status(401).json({code: NOT_AUTHENTICATED_ERROR, error: "Not authenticated" })

  const user = await userRepository.findById(req.userId)
  if (!user)
    return res.status(404).json({code: NO_SUCH_USER_ERROR, error: "No such user" })
  if (user.emailVerifiedAt === null)
    return res.status(403).json({code: UNVERIFIED_EMAIL_ERROR, error: "Email not verified" })
  next()
}
export default requireAuth