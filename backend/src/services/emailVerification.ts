import { userRepository, otpVerificationRepository } from "../data/repositories/index.ts";
import { codeMatches, generateCode, hashCode, RESEND_COOLDOWN_MS } from "./codes.ts";
import { OtpType, OtpVerification } from "../../generated/client.ts";
import { sendMail, CONFIRM_EMAIL_SUBJECT, CONFIRM_EMAIL_BODY } from "./mailer.ts";

type SuccessType = { status: "success"; }
type SuccessTypeWithOTP<T> = SuccessType & { data: T }
type FailureType = { status: "error"; code: number; error: string; }

type ResultType = FailureType | SuccessType
type ResultTypeWithData<T> = FailureType | SuccessTypeWithOTP<T>

export async function startOtpVerification(userId: string, email: string, type: OtpType): Promise<ResultType> {
    const existingCode = await otpVerificationRepository.findByUserId(userId, type)
    if (existingCode && (new Date().getTime() - existingCode.sentAt.getTime()) < RESEND_COOLDOWN_MS)
        return ({ status: "error", code: 429, error: "too many requests" })
    const existingUser = await userRepository.findByEmail(email)

    if (existingUser && existingUser.id !== userId)
        return ({ status: "error", code: 409, error: "email already in use" })
    const code = generateCode();
    await otpVerificationRepository.upsert(userId, email, hashCode(code), type)
    await sendMail(email, `${CONFIRM_EMAIL_SUBJECT} ${code}`, CONFIRM_EMAIL_BODY)
    return { status: "success" }
}

export async function attemptCode(userId: string, providedOTP: string, type: OtpType): Promise<ResultTypeWithData<OtpVerification>> {
    if (!await otpVerificationRepository.incrementAttempts(userId, type)) {
        return { status: "error", code: 400, error: "Code expired or too many attempts: request a new one" }
    }
    const expectedCode = await otpVerificationRepository.findByUserId(userId, type)

    if (!expectedCode)
        return { status: "error", code: 404, error: "No OTP was generated for this user" }

    if (codeMatches(providedOTP, expectedCode.codeHash)) {
        if (await otpVerificationRepository.delete(userId, type, expectedCode.codeHash))
            return { status: "success", data: expectedCode }
    }

    return { status: "error", code: 400, error: "Incorrect OTP" }
}
