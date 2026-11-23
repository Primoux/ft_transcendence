import { OtpType } from "../../generated/enums.ts";
import { authRepository, otpVerificationRepository, SESSION_COOKIE, userRepository } from "../data/repositories/index.ts";
import type { Request, Response } from "express";
import { startOtp } from "./emailVerification.ts";
import { MAX_ATTEMPTS } from "./codes.ts";

type CompleteLoginReturnType =  {status: "logged_in"}
                            | {status: "2fa_required", codeSent: boolean}
                            | {status: "2fa_rate_limit"}
                            | {status: "error" }
export async function startSession(req: Request, res: Response, userId: string) {
    const previousSession = req.cookies[SESSION_COOKIE]

    if (previousSession)
        await authRepository.revokeSessionByToken(previousSession)
    await authRepository.createSession(req, res, userId)
    return ({ status: "success" })
}

export async function completeLogin(req: Request, res: Response, userId: string): Promise<CompleteLoginReturnType> {
    const user = await userRepository.findById(userId)
    if (!user)
        return ({ status: "error" })
    if (user.twoFactorEnabledAt === null) {
        await startSession(req, res, userId)
        return ({ status: "logged_in" })
    }
    const result = await startOtp(userId, OtpType.CAN_LOGIN)
    if (result.status === "error") {
        if (result.code === 429) {
            const existingOtp = await otpVerificationRepository.findByUserId(userId, OtpType.CAN_LOGIN)
            if (!existingOtp || existingOtp.attempts >= MAX_ATTEMPTS || existingOtp.expiresAt.getTime() < new Date().getTime())
                return ({ status: "2fa_rate_limit"})
        }
        else
            return ({ status: "error" })
    }

    const token = authRepository.generateToken()
    const hashedToken = authRepository.hashToken(token)
    authRepository.setLoginCookie(res, token)
    await otpVerificationRepository.setLoginToken(userId, hashedToken)
    return ({ status: "2fa_required", codeSent: result.status === "success"})
}