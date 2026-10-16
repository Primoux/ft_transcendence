import express from 'express'

const router = express.Router()

router.get("/", (req, res) => {
    res.json({msg: "hw"});
})

/*

router.get("/classic", (req, res) => {

// TODO: Get the daily classic mode card

});


router.get("/unlimited", (req, res) => {

// TODO: Get a card from the unlimited pool

})

router.post("/unlimited",  (req, res) =>{

// TODO : compare the content of req with the daily card (in db)

})

router.post("/classic", async (req, res) => {

// TODO: Same as above

})
*/

export default router