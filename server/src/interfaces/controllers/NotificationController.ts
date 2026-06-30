import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';
import { GetUserNotificationsUseCase } from '../../application/use-cases/notification/GetUserNotificationsUseCase';
import { MarkNotificationReadUseCase } from '../../application/use-cases/notification/MarkNotificationReadUseCase';
import { logger } from '../../container';

export class NotificationController {
    constructor(
        private getUserNotificationsUseCase: GetUserNotificationsUseCase,
        private markNotificationReadUseCase: MarkNotificationReadUseCase
    ) {}

    getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const notifications = await this.getUserNotificationsUseCase.execute(userId);
            res.status(200).json({ success: true, data: notifications });
        } catch (error: any) {
            logger.error(`Error in getNotifications: ${error.message}`);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.markNotificationReadUseCase.execute(id as string);
            res.status(200).json({ success: true, message: 'Notification marked as read' });
        } catch (error: any) {
            logger.error(`Error in markAsRead: ${error.message}`);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            await this.markNotificationReadUseCase.executeAll(userId);
            res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } catch (error: any) {
            logger.error(`Error in markAllAsRead: ${error.message}`);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
}
