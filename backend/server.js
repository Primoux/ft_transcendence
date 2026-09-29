import express from 'express';

const app = express();

app.get("/", (req, res) => {
    res.send("hw");
})

app.listen(5003, () => {
    console.log("server running");
});