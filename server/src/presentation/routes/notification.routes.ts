import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { notificationController } from "../../infrastructure/di/container";

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.delete('/clear-all', notificationController.clearAll);
router.put('/:id/read', notificationController.markAsRead);

export default router;
