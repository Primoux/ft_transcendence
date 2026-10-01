import express from 'express'

const router = express.Router()

router.get("/", (req, res) => {
    res.send("hw");
})

export default router