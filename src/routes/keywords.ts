import express from "express";

import { generateKeywords } from "../controllers/keywordsController";

export const router = express.Router();

router.post("/generate-keywords", generateKeywords);
