import express from 'express'
import { prisma } from '../data/prisma'

const router = express.Router()

async function getStatData(userId: string) {
    const sessions = await prisma.gameSession.findMany({
        where: {
           userId,
           status: "WON"
        },
        select: {
            _count: {
                select: { guesses: true }
            }
        }
    })
    const wonSessionsCount = sessions.length
    const totalGuessCount = sessions.reduce((accumulator, session) => accumulator + session._count.guesses, 0);
    const avgGuessCount = wonSessionsCount > 0 ? totalGuessCount / wonSessionsCount : null

    return {wonSessionsCount, avgGuessCount}
}

/**
 * @returns all users.
 */
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
    if (!req.userId) { return res.status(401).json({error: "No token provided"}) }

    const me = await prisma.user.findUnique({
        where: {
            id: req.userId
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true
        }
    })

    if (!me) { return res.status(404).json({error: "no such user"})}

    return res.status(200).json(me)

})

/**
 * @returns the public profile data of specified user
 */
router.get("/:username", async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            username: req.params.username
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
            privateProfile: true
        }
    });
    if (user === null) {
        res.status(404).json({error: "User not found"});
    } else {
        res.json(user);
    }
})

router.get("/:username/stats", async (req, res) =>{
    const user = await prisma.user.findUnique({
        where: {
            username: req.params.username
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
            privateProfile: true
        }
    });
    if (user === null) {
        return res.status(404).json({error: "User not found"});
    }
    if (user.id != req.userId && user.privateProfile) {
        return res.status(401).json({error: "This user's profile is private."})
    }
    const userStats = getStatData(user.id);

    return res.json(userStats);
})

export default router