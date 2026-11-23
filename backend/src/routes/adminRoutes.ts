import express from "express";
import * as zod from "zod";
import { userRepository } from "../data/repositories/index.ts";
import { requireRole } from "../middleware/roleMiddleware.ts";
import { changeRoleSchema } from "../utils/validation/zodSchema.ts";

const router = express.Router();

// every route of this file is reserved to staff
router.use(requireRole("MODERATOR", "ADMIN", "OWNER"));

/**
 * @returns all users, for the admin page.
 */
router.get("/users", async (req, res) => {
  const users = await userRepository.findAll();
  res.json(users);
});

/**
 * Changes the role of a user. Moderators can't change roles.
 * - nobody can touch the owner (and the schema forbids giving OWNER)
 * - only the owner can promote someone to admin or demote an admin
 */
router.patch("/users/:id/role", requireRole("ADMIN", "OWNER"), async (req, res) => {
  const parsedData = zod.safeParse(changeRoleSchema, req.body);
  if (!parsedData.success)
    return res.status(400).send(zod.flattenError(parsedData.error));

  const { role } = parsedData.data;

  // the extra middleware breaks Express' param typing, but ":id" is always a single string
  const target = await userRepository.findById(req.params.id as string);
  if (!target) {
    return res.status(404).json({ error: "no such user" });
  }
  if (target.role === "OWNER") {
    return res.status(403).json({ error: "The owner's role can't be changed" });
  }

  // requireRole already checked the role, but doesn't hand it over: read it again
  const me = await userRepository.findById(req.userId!);
  if (!me) {
    return res.status(500).json({ error: "Internal server error" });
  }
  if (target.id === me.id) {
    return res.status(403).json({ error: "You can't change your own role" });
  }
  const touchesAdmin = target.role === "ADMIN" || role === "ADMIN";
  if (touchesAdmin && me.role !== "OWNER") {
    return res.status(403).json({ error: "Only the owner can manage admins" });
  }

  const updated = await userRepository.updateById(target.id, { role });
  res.json(updated);
});

export default router;
