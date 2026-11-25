import { userRepository, emailVerificationRepository} from "../data/repositories/index.ts";
import { codeMatches, generateCode, hashCode, RESEND_COOLDOWN_MS } from "./codes.ts";
import { Prisma } from "../../generated/client.ts";
import { sendMail, CONFIRM_EMAIL_SUBJECT, CONFIRM_EMAIL_BODY } from "./mailer.ts";

type FailureType = {
    status: "error"
    code: number
    error: string
}

type SuccessType = {
    status: "success"
}

export async function start(userId: string, email: string) : Promise<FailureType | SuccessType> {
    const existingCode = await emailVerificationRepository.findByUserId(userId)
    if (existingCode && (new Date().getTime() - existingCode.sentAt.getTime()) < RESEND_COOLDOWN_MS)
        return ({status: "error", code: 429, error: "too many requests"})
    const existingUser = await userRepository.findByEmail(email)

    if (existingUser && existingUser.id !== userId)
        return ({status: "error", code: 409, error: "email already in use"})
    const code = generateCode();
    await emailVerificationRepository.upsert(userId, email, hashCode(code))
    await sendMail(email, `${CONFIRM_EMAIL_SUBJECT} ${code}` , CONFIRM_EMAIL_BODY)
    return {status: "success"}
}

export async function attemptCode(userId: string, providedOTP: string): Promise<FailureType | SuccessType> {
    if (!await emailVerificationRepository.incrementAttempts(userId)) {
		return {status: "error", code: 400, error:"Code expired or too many attempts: request a new one"}
    }
    const expectedCode = await emailVerificationRepository.findByUserId(userId)
	if (!expectedCode)
		return {status: "error", code: 404, error:"No OTP was generated for this user"}

	if (codeMatches(providedOTP, expectedCode.codeHash))
    {
		try {
			await userRepository.confirmEmail(userId, expectedCode.email)
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2002") {
                    return {status: "error", code: 409, error:"email already in use"}
				}
			}
            throw err
		}
		return {status: "success"}
    }
	else
		return {status: "error", code: 400, error:"Incorrect OTP"}
}