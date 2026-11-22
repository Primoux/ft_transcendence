import express from 'express'
import { otpVerificationRepository, userRepository } from '../data/repositories/index.ts'
import * as zod from 'zod'
import { attemptCode, startEmailVerification, startOtp } from '../services/emailVerification.ts';
import { emailSchema, otpSchema } from '../utils/validation/zodSchema.ts';
import { OtpType } from '../../generated/enums.ts';
import { Prisma } from '../../generated/client.ts';

const router = express.Router()

router.post("/email", async (req, res) => {
  if (!req.userId)
    return res.status(401).json({ error: "no userId provided" })

  const user = await userRepository.findById(req.userId)

  if (!user)
    return res.status(404).json({ error: "no such user" })

  const newEmail = zod.safeParse(emailSchema, req.body?.newEmail)
  if (newEmail.error)
    return res.status(400).json({ error: "invalid new email" })

  const existingEmailuser = await userRepository.findByEmail(newEmail.data)
  if (existingEmailuser !== null)
    return res.status(409).json({ error: "email already in use" })

  if (user.twoFactorEnabledAt) {
    const otp = zod.safeParse(otpSchema, req.body?.code)
    if (otp.error)
      return res.status(403).json({ code: "2FA_CODE_REQUIRED", error: "Invalid or missing OTP" })
    const codeResult = await attemptCode(req.userId, otp.data, OtpType.CAN_CHANGE_EMAIL)
    if (codeResult.status === "error")
      return res.status(codeResult.code).json({ error: codeResult.error })
  }

  const startResult = await startEmailVerification(req.userId, newEmail.data)
  if (startResult.status === "error")
    return res.status(startResult.code).json({ error: startResult.error })
  return res.status(200).send()

})

router.post("/email/resend", async (req, res) => {
  if (!req.userId)
    return res.status(401).json({ error: "no userId provided" })
  const pending = await otpVerificationRepository.findByUserId(req.userId, OtpType.EMAIL_IS_VALID)

  if (!pending?.email)
    return res.status(404).json({ error: "no email to confirm" })
  const result = await startEmailVerification(req.userId, pending.email)
  if (result.status === "error")
    return res.status(result.code).json({ error: result.error })
  return res.status(200).send()
})

router.post("/email/verify", async (req, res) => {
  if (!req.userId)
    return res.status(401).json({ error: "no userId provided" })
  const parsedData = zod.safeParse(otpSchema, req.body?.code)
  if (parsedData.error)
    return res.status(400).json({ error: "incorrect format" })

  const result = await attemptCode(req.userId, parsedData.data, OtpType.EMAIL_IS_VALID)
  if (result.status === "error")
    return res.status(result.code).json({ error: result.error })
  try {
    if (!result.data.email)
      return res.status(404).json({ error: "no email to confirm" })
    await userRepository.confirmEmail(result.data.userId, result.data.email)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "email already in use" })
      }
    }
    throw err
  }
  return res.status(200).send()
})

router.post("/email/send-change-otp", async (req, res) => {
  if (!req.userId)
    return res.status(401).json({ error: "no userId provided" })

  const result = await startOtp(req.userId, OtpType.CAN_CHANGE_EMAIL)

  if (result.status === "error")
    return res.status(result.code).json({ error: result.error })
  return res.status(200).send()
})
export default router