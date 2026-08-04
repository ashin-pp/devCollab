import { Router } from "express";
import { planController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, planController.getPlans);

export default router;
