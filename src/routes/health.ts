import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
    console.log("Health check endpoint hit");
    res.status(200).send("Healthy");
});

export default router;