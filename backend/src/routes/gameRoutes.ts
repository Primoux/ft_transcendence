import express from 'express'

const router = express.Router()

router.get("/", (req, res) => {
    res.json({msg: "hw"});
})

export default router