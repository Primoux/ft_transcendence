import express from 'express'
import { Prisma, FriendshipStatus, type Friendship } from "../../generated/client.ts"
import bcrypt from 'bcryptjs'
import * as zod from 'zod'
import { changeUsernameSchema, changePasswordSchema } from '../utils/validation/zodSchema.ts';
import { userRepository, gameSessionRepository, authRepository, friendshipRepository } from '../data/repositories/index.ts';
import { avatarUpload } from '../middleware/uploadMiddleware.ts'
import { normalizeAvatar, saveAvatar, deleteAvatar, InvalidImageError } from "../services/avatars.ts"

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

/**
 * @returns the accepted friendships of the logged-in user, one FriendSummary each.
 */
router.get("/me/friends", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "No token provided" });
  }

  const friends = await friendshipRepository.findFriends(req.userId);
  return res.status(200).json(friends);
});

router.get("/me/friend-requests", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "No token provided" });
  }

  const requests = await friendshipRepository.findPendingRequests(req.userId);
  return res.status(200).json(requests);
});

router.post("/me/friend-requests/:friendshipId/accept", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "No token provided" });
  }

  const friendship = await friendshipRepository.findById(req.params.friendshipId);
  if (!friendship || friendship.receiverId !== req.userId) {
    return res.status(404).json({ error: "no such friend request" });
  }
  if (friendship.status !== FriendshipStatus.PENDING) {
    return res.status(409).json({ error: "friend request already accepted" });
  }

  const accepted = await friendshipRepository.updateById(friendship.id, {
    status: FriendshipStatus.ACCEPTED,
  });
  return res.status(200).json(friendshipStateFor(req.userId, accepted));
});

router.delete("/me/friendships/:friendshipId", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "No token provided" });
  }

  const friendship = await friendshipRepository.findById(req.params.friendshipId);
  if (
    !friendship ||
    (friendship.senderId !== req.userId && friendship.receiverId !== req.userId)
  ) {
    return res.status(404).json({ error: "no such friendship" });
  }

  await friendshipRepository.delete(friendship.id);
  return res.status(204).end();
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
if (!req.userId) {return res.status(401).json({error: "no user provided"})}
    const currentUser = await userRepository.findById(req.userId)

    if (!currentUser) {return res.status(404).json({error: "user not found"})}

    const response = await userRepository.updateById(req.userId, {privateProfile: !currentUser.privateProfile});
    
    return res.status(200).json(response)
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

router.patch("/me/avatar", avatarUpload, async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "no file in field 'avatar'" })

    let webp: Buffer
    try {
      webp = await normalizeAvatar(req.file.buffer)
    } catch (err) {
      if (err instanceof InvalidImageError) return res.status(400).json({ error: "PNG, JPEG, or WebP only" })
      throw err
    }

    const previous = (await userRepository.findById(req.userId!))?.avatarKey
    const avatarKey = await saveAvatar(webp)
    const user = await userRepository.updateById(req.userId!, { avatarKey })
    if (previous) await deleteAvatar(previous)

    res.json(user)
  })

type FriendshipState =
  | { status: "none" }
  | { status: "pending-sent" | "pending-received" | "friends"; friendshipId: string };

function friendshipStateFor(viewerId: string, friendship: Friendship | null): FriendshipState {
  if (!friendship) {
    return { status: "none" };
  }
  if (friendship.status === FriendshipStatus.ACCEPTED) {
    return { status: "friends", friendshipId: friendship.id };
  }
  return {
    status: friendship.senderId === viewerId ? "pending-sent" : "pending-received",
    friendshipId: friendship.id,
  };
}

router.get("/:username/friendship", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "No token provided" });
  }

  const user = await userRepository.findByUsername(req.params.username);
  if (user === null) {
    return res.status(404).json({ error: "User not found" });
  }
  if (user.id === req.userId) {
    return res.status(400).json({ error: "cannot be friends with yourself" });
  }

  const friendship = await friendshipRepository.findByUsers(req.userId, user.id);
  return res.status(200).json(friendshipStateFor(req.userId, friendship));
});

router.post("/:username/friend-request", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "No token provided" });
  }

  const user = await userRepository.findByUsername(req.params.username);
  if (user === null) {
    return res.status(404).json({ error: "User not found" });
  }
  if (user.id === req.userId) {
    return res.status(400).json({ error: "cannot be friends with yourself" });
  }

  const existing = await friendshipRepository.findByUsers(req.userId, user.id);
  if (existing) {
    const isReverseRequest =
      existing.status === FriendshipStatus.PENDING && existing.receiverId === req.userId;
    if (!isReverseRequest) {
      return res.status(409).json(friendshipStateFor(req.userId, existing));
    }
    const accepted = await friendshipRepository.updateById(existing.id, {
      status: FriendshipStatus.ACCEPTED,
    });
    return res.status(200).json(friendshipStateFor(req.userId, accepted));
  }

  try {
    const created = await friendshipRepository.create(req.userId, user.id);
    return res.status(201).json(friendshipStateFor(req.userId, created));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ error: "friend request already sent" });
    }
    throw error;
  }
});

export default router;
