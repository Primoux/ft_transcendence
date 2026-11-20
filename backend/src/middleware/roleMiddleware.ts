import type { Request, Response, NextFunction } from "express";
import type { Role } from "../../generated/client.ts";
import { userRepository } from "../data/repositories/index.ts";

/**
 * Lets the request through only if the logged-in user has one of `roles`.
 * Must run after requireAuth, which sets req.userId.
 * The role is read from the database on every request, so a demotion applies immediately.
 */
export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await userRepository.findById(req.userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
