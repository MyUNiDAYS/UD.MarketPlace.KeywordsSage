import express from "express";
import { generateKeywords } from "../controllers/keywordsController";

const router = express.Router();

router.post("/generate-keywords", generateKeywords);

export default router;