import { Router } from "express";
import { aiController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate.middleware";
import {
    aiDashboardQuerySchema,
    clearAiDashboardBodySchema,
    processAiBodySchema,
    updateAiTaskStatusBodySchema,
    updateAiTaskStatusParamsSchema,
} from "../validators/ai.schema";

const router = Router();

router.post(
    "/process",
    authMiddleware,
    validate({ body: processAiBodySchema }),
    aiController.processMessage
);
router.get(
    "/dashboard",
    authMiddleware,
    validate({ query: aiDashboardQuerySchema }),
    aiController.getDashboard
);
router.post(
    "/dashboard/clear",
    authMiddleware,
    validate({ body: clearAiDashboardBodySchema }),
    aiController.clearDashboardTab
);
router.patch(
    "/tasks/:taskId/status",
    authMiddleware,
    validate({
        params: updateAiTaskStatusParamsSchema,
        body: updateAiTaskStatusBodySchema,
    }),
    aiController.updateTaskStatus
);

export default router;
