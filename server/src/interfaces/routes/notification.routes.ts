import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { notificationController } from '../../container';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

export default router;
