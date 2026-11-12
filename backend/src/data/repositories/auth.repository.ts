import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { prisma } from "../../data/prisma.ts";

export const SESSION_COOKIE = "__Host-session";
const IDLE_MS = 7 * 24 * 60 * 60 * 1000;      // logged out after 7 days of inactivity
const ABSOLUTE_MS = 30 * 24 * 60 * 60 * 1000; // and after 30 days no matter what

const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax", path: "/" } as const;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");


export const authRepository = {

    async createSession(req: Request, res: Response, userId: string) {
        const token = randomBytes(32).toString("base64url");
        const now = Date.now();
        await prisma.authSession.create({
            data: {
            id: hashToken(token),
            userId,
            expiresAt: new Date(now + IDLE_MS),
            absoluteExpiresAt: new Date(now + ABSOLUTE_MS),
            userAgent: req.get("user-agent")?.slice(0, 256),
            ip: req.ip,
            },
        });
        res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: ABSOLUTE_MS });
    },

    async validateSession(token: string) {
        const id = hashToken(token);
        const session = await prisma.authSession.findUnique({ where: { id } });
        if (!session) return null;

        const now = Date.now();
        if (now >= session.expiresAt.getTime() || now >= session.absoluteExpiresAt.getTime()) {
            await prisma.authSession.deleteMany({ where: { id } });
            return null;
        }
        // Sliding expiry: only write when half the idle window has passed, not on every request.
        if (session.expiresAt.getTime() - now < IDLE_MS / 2) {
            await prisma.authSession.updateMany({
            where: { id },
            data: {
                expiresAt: new Date(Math.min(now + IDLE_MS, session.absoluteExpiresAt.getTime())),
                lastSeenAt: new Date(now),
            },
            });
        }
        return session;
    },

    async revokeSessionByToken(token: string) {
        await prisma.authSession.deleteMany({ where: { id: hashToken(token) } });
    },

    async revokeOtherSessions(userId: string, keepSessionId: string) {
        await prisma.authSession.deleteMany({ where: { userId, id: { not: keepSessionId } } });
    },

    async revokeAllSessions(userId: string) {
        await prisma.authSession.deleteMany({ where: { userId } });
    },

    clearSessionCookie(res: Response) {
        res.clearCookie(SESSION_COOKIE, cookieOptions);
    },

    async purgeExpiredSessions() {
        const now = new Date();
        await prisma.authSession.deleteMany({
            where: { OR: [{ expiresAt: { lt: now } }, { absoluteExpiresAt: { lt: now } }] },
        });
    },
};