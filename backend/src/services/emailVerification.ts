import { userRepository, otpVerificationRepository } from "../data/repositories/index.ts";
import { codeMatches, generateCode, hashCode, RESEND_COOLDOWN_MS } from "./codes.ts";
import { OtpType, OtpVerification } from "../../generated/client.ts";
import { sendMail, emailDetails } from "./mailer.ts";

type SuccessType = { status: "success"; }
type SuccessTypeWithOTP<T> = SuccessType & { data: T }
type FailureType = { status: "error"; code: number; error: string; }

type ResultType = FailureType | SuccessType
type ResultTypeWithData<T> = FailureType | SuccessTypeWithOTP<T>

export async function sendOtp(userId: string, to: string, type: OtpType, pendingEmail?: string): Promise<ResultType> {
    const existingCode = await otpVerificationRepository.findByUserId(userId, type)
    if (existingCode && (new Date().getTime() - existingCode.sentAt.getTime()) < RESEND_COOLDOWN_MS)
        return ({ status: "error", code: 429, error: "too many requests" })
    const code = generateCode();
    await otpVerificationRepository.upsert(userId,hashCode(code), type, pendingEmail)
    const { subject, body } = emailDetails[type]
    await sendMail(to, `${subject}: ${code}`, `${body}\n\nYour code: ${code}\nIt expires in 5 minutes.`)
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

export async function startEmailVerification(userId: string, newEmail: string): Promise<ResultType> {
    const existingEmailUser = await userRepository.findByEmail(newEmail)
    if (existingEmailUser && existingEmailUser.id !== userId)
        return ({ status: "error", code: 409, error: "email already in use" })

    return (sendOtp(userId, newEmail, OtpType.EMAIL_IS_VALID, newEmail))
}

export async function startOtp(userId: string, type: OtpType): Promise<ResultType> {
    const user = await userRepository.findMe(userId)
    
    if (!user?.email)
        return ({status: "error", code: 403, error: "no user / email"})
    return (await(sendOtp(userId, user.email, type)))
}