import bcrypt from "bcryptjs";
import express from "express";
import { OtpType, Prisma } from "../../generated/client.ts";
import * as zod from 'zod'
import { loginSchema, registerSchema } from '../utils/validation/zodSchema.ts'
import {SESSION_COOKIE, authRepository, userRepository} from '../data/repositories/index.ts'
import { requireAuth } from '../middleware/authMiddleware.ts'
import { startOtpVerification } from "../services/emailVerification.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "auth home" });
});

const DUMMY_HASH = bcrypt.hashSync("timing-equalizer", 10);

router.post("/login", async (req, res) => {
  const parsedData = zod.safeParse(loginSchema, req.body)
  if (!parsedData.success)
    return res.status(400).send(zod.flattenError(parsedData.error));
  const { username, password } = parsedData.data;
  try {
    const user = await userRepository.findForAuthByUsername(username);
    // OAuth-only accounts have no hash: compare against the dummy anyway, so the response time
    // doesn't reveal which usernames exist or how they sign in.
    const validPassword = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user?.passwordHash || !validPassword) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const previous = req.cookies[SESSION_COOKIE];
    if (previous) await authRepository.revokeSessionByToken(previous);

    await authRepository.createSession(req, res, user.id);
    const publicUser = await userRepository.findMe(user.id)
    res.json(publicUser);
  } catch (err) {
    return res.status(500).json({ error: "Error while checking credentials" });
  }
});

router.post("/register", async (req, res) => {
  const parsedData = zod.safeParse(registerSchema, req.body);
  if (!parsedData.success) {
    return res.status(400).send(zod.flattenError(parsedData.error));
  }
  const { username, password, email} = parsedData.data;

  const existingEmailuser = await userRepository.findByEmail(email)

  if (existingEmailuser)
    return res.status(409).json({error: "email already in use"})
  let newUser;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    newUser = await userRepository.create({
      username,
      passwordHash: hashedPassword,
    });
    await authRepository.createSession(req, res, newUser.id);
    await startOtpVerification(newUser.id, email, OtpType.EMAIL_IS_VALID)

    return res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "username already taken" });
      }
    }
    throw error;
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies[SESSION_COOKIE];
  if (token) await authRepository.revokeSessionByToken(token);
  authRepository.clearSessionCookie(res);
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" }); // old JWT cookie. Delete this line in a later release
  res.status(200).json({ message: "user disconnected" });
});

router.post("/logout-all", requireAuth, async (req, res) => {
  await authRepository.revokeAllSessions(req.userId!);
  authRepository.clearSessionCookie(res);
  res.status(200).json({ message: "all sessions revoked" });
});

export default router;
