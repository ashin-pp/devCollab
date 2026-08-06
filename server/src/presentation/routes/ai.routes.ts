import { Router } from "express";
import { aiController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post('/process', authMiddleware, aiController.processMessage);
router.get('/dashboard', authMiddleware, aiController.getDashboard);
router.post('/dashboard/clear', authMiddleware, aiController.clearDashboardTab);
router.patch('/tasks/:taskId/status', authMiddleware, aiController.updateTaskStatus);

export default router;
