import express from 'express'
import { emailVerificationRepository } from '../data/repositories/index.ts' 
import * as zod from 'zod'
import { start, attemptCode } from '../services/emailVerification.ts';
import { emailSchema, otpSchema} from '../utils/validation/zodSchema.ts';

const router = express.Router()

router.post("/email", async (req, res) => {
  if (!req.userId)
    return res.status(401).json({error: "no userId provided"})
  const result  = zod.safeParse(emailSchema, req.body.email)

  if (result.error)
	return res.status(400).json({error: "bad request"})

  const startResult = await start(req.userId, result.data)
  if (startResult.status === "error")
    return res.status(startResult.code).json({error: startResult.error})
  return res.status(200).send()
  
})

router.post("/email/resend", async(req, res) =>{
  if (!req.userId)
    return res.status(401).json({error: "no userId provided"})
  const pending = await emailVerificationRepository.findByUserId(req.userId)

  if (!pending)
    return res.status(404).json({error: "no email to confirm"})
  const result = await start(req.userId, pending.email)
  if (result.status === "error")
    return res.status(result.code).json({error: result.error})
  return res.status(200).send()
})

router.post("/email/verify", async(req, res) =>{
  if (!req.userId)
    return res.status(401).json({error: "no userId provided"})
  const parsedData = zod.safeParse(otpSchema, req.body)
  if (parsedData.error)
	return res.status(400).json({error: "incorrect format"})

  const result = await attemptCode(req.userId, parsedData.data.code)
  if (result.status === "error")
    return res.status(result.code).json({error: result.error})
  return res.status(200).send()
})
export default router