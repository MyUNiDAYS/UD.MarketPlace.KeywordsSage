import express from "express";

import { router as healthRouter } from "./health";
import { router as keywordsRouter } from "./keywords";

export const router = express.Router();

router.use(keywordsRouter);
router.use(healthRouter);
