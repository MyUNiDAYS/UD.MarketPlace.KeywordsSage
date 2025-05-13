import express from "express";
import keywordsRoutes from "./keywords";
import healthRoutes from "./health";

const router = express.Router();

router.use(keywordsRoutes);
router.use(healthRoutes);

export default router;