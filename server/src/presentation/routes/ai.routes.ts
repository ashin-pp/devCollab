import { Router } from "express";
import { aiController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate.middleware";
import {
    aiDashboardQuerySchema,
    clearAiDashboardBodySchema,
    joinAiScheduleVideoParamsSchema,
    processAiBodySchema,
    startDmVideoCallBodySchema,
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
router.get(
    "/schedules/:scheduleId/video-token",
    authMiddleware,
    validate({ params: joinAiScheduleVideoParamsSchema }),
    aiController.joinScheduleVideo
);
router.post(
    "/schedules/dm-call",
    authMiddleware,
    validate({ body: startDmVideoCallBodySchema }),
    aiController.startDmVideoCall
);

export default router;
