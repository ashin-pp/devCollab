import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { notificationController } from "../../infrastructure/di/container";
import { validate } from "../middlewares/validate.middleware";
import { notificationIdParamsSchema } from "../validators/notification.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", notificationController.getNotifications);
router.put("/mark-all-read", notificationController.markAllAsRead);
router.delete("/clear-all", notificationController.clearAll);
router.put(
    "/:id/read",
    validate({ params: notificationIdParamsSchema }),
    notificationController.markAsRead
);

export default router;
