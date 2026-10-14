import express from 'express'
import { prisma } from './../lib/prisma'

const router = express.Router()

router.get("/", async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            displayName: true
        }
    });
    res.json(users);
})

router.get("/me", async (req, res) => {
    if (!req.userId) {return res.status(401).json({error: "no token provided"})}
    const currentUser = await prisma.user.findUnique({
        where: {
            id: req.userId
        },
        select: {
            id: true,
            displayName: true,
            username: true
        }
    })
    if (currentUser === null) {
        return res.status(404).json({error: "user not found"})
    }
    return (res.status(200).json(currentUser))
})

// router.get("/:id", async (req, res) => {
//     const user = await prisma.user.findUnique({
//         where: {
//             id: parseInt(req.params.id)
//         },
//         select: {
//             id: true,
//             displayName: true
//         }
//     });
//     if (user) {
//         res.json(user);
//     }
//     else {
//         res.status(404).json({error: "User not found"});
//     }
// })

router.get("/:username", async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            username: req.params.username
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            registerDate: true,
        }
    });
    if (user === null) {
        res.status(404).json({error: "User not found"});
    } else {
        res.json(user);
    }
})


export default router