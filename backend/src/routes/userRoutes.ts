import express from 'express'
import { Prisma } from "../../generated/client.ts"
import bcrypt from 'bcryptjs'
import * as zod from 'zod'
import { changeUsernameSchema, changePasswordSchema } from '../utils/validation/zodSchema.ts';
import { userRepository, gameSessionRepository, authRepository } from '../data/repositories/index.ts';

const router = express.Router();

async function getStatData(userId: string) {
  const wonSession = await gameSessionRepository.findWonSessionsSummary(userId);
  const wonSessionsCount = wonSession.length;
  const totalGuessCount = wonSession.reduce(
    (accumulator, guessCount) => accumulator + guessCount,
    0,
  );
  const avgGuessCount =
    wonSessionsCount > 0 ? totalGuessCount / wonSessionsCount : null;

  return { wonSessionsCount, avgGuessCount };
}

/**
 * @returns all users.
 */
router.get("/", async (req, res) => {
  const users = await userRepository.findAll();
  res.json(users);
});

/**
 * NOTE : the existence of this route makes any user with the username 'me' unable to access their profile.
 * Indeed, "/me" shadows "/:username where 'username' is 'me'. "
 * The issue is alrady handled by the minimum of 3 characters for all usernames.
 */

router.get("/me", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "No token provided" });
  }

  const me = await userRepository.findById(req.userId);
  if (!me) {
    return res.status(404).json({ error: "no such user" });
  }

  return res.status(200).json(me);
});

router.patch("/me/username", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "No token provided" });
  }
  const parsedData = zod.safeParse(changeUsernameSchema, req.body);
  if (!parsedData.success)
    return res.status(400).send(zod.flattenError(parsedData.error));

  const { newUsername } = parsedData.data;

  try {
    const response = await userRepository.updateById(req.userId, {
      username: newUsername,
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        return res.status(409).json({ error: "username already taken" });
      if (error.code === "P2025")
        return res.status(404).json({ error: "no such user" });
    }
    throw error;
  }
});

router.patch("/me/privateProfile", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "no user provided" });
  }

  try {
    const response = await userRepository.togglePrivateProfile(req.userId);

    return res.status(200).json(response);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return res.status(404).json({ error: "no such user" });
  }
});

router.post("/me/changePassword", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "no user provided" });
  const parsedData = zod.safeParse(changePasswordSchema, req.body);
  if (!parsedData.success)
    return res.status(400).send(zod.flattenError(parsedData.error));

  const response = await userRepository.findForAuthById(req.userId);
  if (!response) {
    return res.status(404).json({ error: "no such user" });
  }

  const { currentPassword, newPassword } = parsedData.data;
  // OAuth-only accounts have no password yet: the session alone lets them set a first one.
  if (response.passwordHash !== null &&
      (currentPassword === undefined || !(await bcrypt.compare(currentPassword, response.passwordHash))))
    return res.status(403).json({ error: "incorrect password" });

  const passwordChangeResponse = await userRepository.updateById(req.userId, {
      passwordHash: await bcrypt.hash(newPassword, 10)
    });
    await authRepository.revokeOtherSessions(req.userId, req.sessionId!);
    return res.status(201).json(passwordChangeResponse)
})

/**
 * @returns the public profile data of specified user
 */
router.get("/:username", async (req, res) => {
  const user = await userRepository.findByUsername(req.params.username);

  if (user === null) {
    res.status(404).json({ error: "User not found" });
  } else {
    res.json(user);
  }
});

router.get("/:username/stats", async (req, res) => {
  const user = await userRepository.findByUsername(req.params.username);

  if (user === null) {
    return res.status(404).json({ error: "User not found" });
  }
  if (user.id !== req.userId && user.privateProfile) {
    return res.status(403).json({ error: "This user's profile is private." });
  }
  const userStats = await getStatData(user.id);

  return res.json(userStats);
});

export default router;
