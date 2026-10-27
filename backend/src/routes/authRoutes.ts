import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../data/prisma";
import * as zod from 'zod'
import { loginSchema, registerSchema } from '../utils/validation/zodSchema'

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "auth home" });
});

router.post("/login", async (req, res) => {
  const parsedData = zod.safeParse(loginSchema, req.body)
  if (!parsedData.success)
    return res.status(400).send(zod.flattenError(parsedData.error))
  const { username, password } = parsedData.data;
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
  const parsedData = zod.safeParse(registerSchema, req.body)
  if (!parsedData.success) {
    return res.status(400).send(zod.flattenError(parsedData.error))
  }
  const {username, displayName, password} = parsedData.data
  let newUser;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    newUser = await prisma.user.create({
      data: {
        username,
        displayName,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        privateProfile: true,
        createdAt: true
      }
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
