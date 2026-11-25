import { prisma } from "../prisma.ts"
import { CODE_TTL_MS, MAX_ATTEMPTS } from "../../services/codes.ts"

export const emailVerificationRepository = {
    async upsert(userId: string, email: string, codeHash: string) {
        const now = new Date()
        const expiresAt = new Date(now.getTime() + CODE_TTL_MS)
        await prisma.emailVerification.upsert({
            where: { userId },
            create: { userId, expiresAt, sentAt: now, email, codeHash },
            update: { email, codeHash, expiresAt, sentAt: now, attempts: 0 }
        })
    },

    async findByUserId(userId: string) {
        const emailVerif = await prisma.emailVerification.findUnique({
            where: {userId}
        })
        return emailVerif
    },

    async incrementAttempts(userId: string) {
        const result = await prisma.emailVerification.updateMany({
            where: {userId,
                    attempts: { lt: MAX_ATTEMPTS },
                    expiresAt: {gt: new Date() }
            },
            data: {attempts: {increment: 1} }
        })

        return (result.count === 1);
    },

    async delete(userId: string) {
        await prisma.emailVerification.deleteMany({
            where: {userId}
        })
    }
}