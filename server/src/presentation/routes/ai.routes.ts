import { Router } from "express";
import { aiController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Process an AI message (handles commands like /task, /summary, etc.)
router.post('/process', authMiddleware, aiController.processMessage);

export default router;
