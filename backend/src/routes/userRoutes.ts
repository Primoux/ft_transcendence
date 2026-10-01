import express from 'express'
import { prisma } from './../lib/prisma'

const router = express.Router()

router.get("/", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
})

router.get("/:id", async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(req.params.id)
        },
        select: {
            id: true,
            displayName: true
        }
    });
    if (user) {
        res.json(user);
    }
    else {
        res.status(404).send("User not found");
    }
})



export default router