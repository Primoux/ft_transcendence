import { prisma } from "../prisma.ts"
import { OtpType } from "../../../generated/enums.ts"
import { CODE_TTL_MS, MAX_ATTEMPTS } from "../../services/codes.ts"

export const otpVerificationRepository = {
    async upsert(userId: string, codeHash: string, type: OtpType, email?: string) {
        const now = new Date()
        const expiresAt = new Date(now.getTime() + CODE_TTL_MS)
        await prisma.otpVerification.upsert({
            where: { type_userId: { userId, type } },
            create: { userId, type, expiresAt, sentAt: now, email, codeHash },
            update: { email: email ?? undefined, codeHash, expiresAt, sentAt: now, attempts: 0 }
        })
    },

    async findByUserId(userId: string, type: OtpType) {
        const emailVerif = await prisma.otpVerification.findUnique({
            where: { type_userId: { userId, type } }
        })
        return emailVerif
    },

    async incrementAttempts(userId: string, type: OtpType) {
        const result = await prisma.otpVerification.updateMany({
            where: {
                userId,
                type,
                attempts: { lt: MAX_ATTEMPTS },
                expiresAt: { gt: new Date() }
            },
            data: { attempts: { increment: 1 } }
        })

        return (result.count === 1);
    },

    async delete(userId: string, type: OtpType, codeHash: string) {
        const result = await prisma.otpVerification.deleteMany({
            where: { userId, type, codeHash }
        })

        return (result.count === 1);
    }
}