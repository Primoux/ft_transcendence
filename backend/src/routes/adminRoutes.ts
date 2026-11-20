import express from "express";
import { userRepository } from "../data/repositories/index.ts";
import { requireRole } from "../middleware/roleMiddleware.ts";

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

export default router;
