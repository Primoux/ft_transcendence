import { authRepository, SESSION_COOKIE, userRepository } from "../data/repositories/index.ts";
import type { Request, Response } from "express";

export async function completeLogin(req: Request, res: Response, userId: string) {
    const previousSession = req.cookies[SESSION_COOKIE]

    if (previousSession)
        await authRepository.revokeSessionByToken(previousSession)
    await authRepository.createSession(req, res, userId)
    return ({status: "success"})
}