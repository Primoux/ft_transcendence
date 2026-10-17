import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../data/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "auth home" });
});

router.post("/login", async (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({ error: "missing required values" });
  } else if (
    typeof req.body.username != "string" ||
    typeof req.body.password != "string"
  ) {
    return res.status(400).json({ error: "unsupported data type" });
  }
  const { username, password } = req.body;
  try {
    let user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        passwordHash: true,
      },
    });
    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!!validPassword) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "4h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 4 * 60 * 60 * 1000,
      });
      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      });
    } else {
      return res.status(401).json({ error: "invalid credentials" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Error while checking credentials" });
  }
});

router.post("/register", async (req, res) => {
  if (
    !req.body ||
    !req.body.username ||
    !req.body.password ||
    !req.body.displayName
  ) {
    return res.status(400).json({ error: "missing required values" });
  } else if (
    typeof req.body.username != "string" ||
    typeof req.body.password != "string" ||
    typeof req.body.displayName != "string"
  ) {
    return res.status(400).json({ error: "unsupported data type" });
  } else if (
    req.body.username.length < 3 ||
    req.body.username.length > 15 ||
    req.body.password.length < 8 ||
    req.body.password.length > 72 ||
    req.body.displayName.length > 30
  ) {
    return res.status(400).json({ error: "values too long / too short" });
  }
  const { username, displayName, password } = req.body;
  let newUser;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    newUser = await prisma.user.create({
      data: {
        username,
        displayName,
        passwordHash: hashedPassword,
      },
    });
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, {
      expiresIn: "4h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 4 * 60 * 60 * 1000,
    });
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

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
  });
  res.status(200).json({ message: "user disconnected" });
});

export default router;
