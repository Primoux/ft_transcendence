import express from "express";
import { userRepository } from "../data/repositories/index.ts";
import { attemptCode, startOtp } from "../services/emailVerification.ts";
import { OtpType } from "../../generated/enums.ts";
import { otpSchema } from "../utils/validation/zodSchema.ts";
import * as zod from 'zod'

const router = express.Router()

router.post("/enable", async (req, res) => {
	if (!req.userId)
		return res.status(401).json({error: "no user logged"});
    const user = await userRepository.findById(req.userId)
    if (!user)
        return res.status(400).json({error: "user not found"})
    if (user.twoFactorEnabledAt !== null)
        return res.status(409).json({error: "2fa already enabled"})
    const result = await startOtp(req.userId, OtpType.CAN_ENABLE_2FA)
    if (result.status === "error")
        return (res.status(result.code).json({error: result.error}))
    return res.status(200).json({ status: "success" })

})

router.post("/enable/verify", async (req, res) => {
	if (!req.userId)
		return res.status(401).json({error: "no user logged"});
    const otp = zod.safeParse(otpSchema, req.body?.code)

    if (otp.error)
        return (res.status(400).json({error: "missing or invalid OTP"}))
    
    const otpResult = await attemptCode(req.userId, otp.data, OtpType.CAN_ENABLE_2FA)
    if (otpResult.status === "error")
        return (res.status(otpResult.code).json({error: otpResult.error}))
    await userRepository.updateById(req.userId, {twoFactorEnabledAt: new Date()})
    return res.status(200).json({ status: "success" })
})

router.post("/disable", async (req, res) => {
	if (!req.userId)
		return res.status(401).json({error: "no user logged"});
    const user = await userRepository.findById(req.userId)
    if (!user)
        return res.status(400).json({error: "user not found"})
    if (user.twoFactorEnabledAt === null)
        return res.status(409).json({error: "2fa already disabled"})
    const result = await startOtp(req.userId, OtpType.CAN_DISABLE_2FA)
    if (result.status === "error")
        return (res.status(result.code).json({error: result.error}))
    return res.status(200).json({ status: "success" })
})

router.post("/disable/verify", async (req, res) => {
	if (!req.userId)
		return res.status(401).json({error: "no user logged"});
    const otp = zod.safeParse(otpSchema, req.body?.code)

    if (otp.error)
        return (res.status(400).json({error: "missing or invalid OTP"}))
    
    const otpResult = await attemptCode(req.userId, otp.data, OtpType.CAN_DISABLE_2FA)
    if (otpResult.status === "error")
        return (res.status(otpResult.code).json({error: otpResult.error}))
    await userRepository.updateById(req.userId, {twoFactorEnabledAt: null})
    return res.status(200).json({ status: "success" })
})

export default router