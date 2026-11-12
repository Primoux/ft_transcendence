import bcrypt from "bcryptjs";
import express from "express";
import { Prisma } from "../../generated/client.ts";
import { prisma } from "../data/prisma.ts";
import * as zod from 'zod'
import { loginSchema, registerSchema } from '../utils/validation/zodSchema.ts'
import {SESSION_COOKIE, authRepository, userRepository} from '../data/repositories/index.ts'
import { requireAuth } from '../middleware/authMiddleware.ts'

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
    const validPassword = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !validPassword) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const previous = req.cookies[SESSION_COOKIE];
    if (previous) await authRepository.revokeSessionByToken(previous);

    await authRepository.createSession(req, res, user.id);
    res.json({ id: user.id, username: user.username, displayName: user.displayName });
  } catch (err) {
    return res.status(500).json({ error: "Error while checking credentials" });
  }
});

router.post("/register", async (req, res) => {
  const parsedData = zod.safeParse(registerSchema, req.body);
  if (!parsedData.success) {
    return res.status(400).send(zod.flattenError(parsedData.error));
  }
  const { username, displayName, password } = parsedData.data;
  let newUser;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    newUser = await userRepository.create({
      username,
      displayName,
      passwordHash: hashedPassword,
    });
    await authRepository.createSession(req, res, newUser.id);

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
