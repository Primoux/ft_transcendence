import express from 'express'
import { otpVerificationRepository, userRepository } from '../data/repositories/index.ts'
import * as zod from 'zod'
import { attemptCode, startOtpVerification } from '../services/emailVerification.ts';
import { emailSchema, otpSchema } from '../utils/validation/zodSchema.ts';
import { OtpType } from '../../generated/enums.ts';
import { Prisma } from '../../generated/client.ts';

const router = express.Router()

router.post("/email", async (req, res) => {
  if (!req.userId)
    return res.status(401).json({ error: "no userId provided" })
  const result = zod.safeParse(emailSchema, req.body.email)

  if (result.error)
    return res.status(400).json({ error: "bad request" })

  const startResult = await startOtpVerification(req.userId, result.data, OtpType.EMAIL_IS_VALID)
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
  const result = await startOtpVerification(req.userId, pending.email, OtpType.EMAIL_IS_VALID)
  if (result.status === "error")
    return res.status(result.code).json({ error: result.error })
  return res.status(200).send()
})

router.post("/email/verify", async (req, res) => {
  if (!req.userId)
    return res.status(401).json({ error: "no userId provided" })
  const parsedData = zod.safeParse(otpSchema, req.body)
  if (parsedData.error)
    return res.status(400).json({ error: "incorrect format" })

  const result = await attemptCode(req.userId, parsedData.data.code, OtpType.EMAIL_IS_VALID)
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
export default router