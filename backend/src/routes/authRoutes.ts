import express from 'express'
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router()

router.get("/", async (req, res) => {
    res.send("auth home")
})

router.post("/login", async (req, res) => {
    const {username, password} = req.body
    let user = await prisma.user.findUnique({
        where: {
            username 
        }
    })
    if (!user)
    {
        return res.status(404).json({error : "invalid credentials"})
    }
    const validPassword = bcrypt.compare(password, user.password)
    if (!!validPassword) {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "4h",
    });
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 4 * 60 * 60 * 1000 ,
    });
    res.json({id: user.id, username: user.username})
    } else {
        return res.status(401).json({error : "invalid credentials"})
    }
})

router.post("/register", async (req, res) => {
    const { username, displayName, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;
    try {
        newUser = await prisma.user.create({
            data: {
                username,
                displayName,
                password: hashedPassword
            },
            select: {
                id: true,
                username: true,
                displayName: true
            }
        });
            const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, {
                expiresIn: "4h",
            });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 4 * 60 * 60 * 1000 ,
        });
        res.json({id: newUser.id, username: newUser.username})
        return res.status(201).json(newUser);
    }
    catch (error) {
        // console.error(error);
        console.log('Error creating user')
        return res.status(500).send("Error creating user");
    }
});
export default router