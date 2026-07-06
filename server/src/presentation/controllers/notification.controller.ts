import { injectable, inject } from 'tsyringe';
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Response, NextFunction } from "express";
import { GetUserNotificationsUseCase } from "../../application/use-cases/notification/get-user-notifications.usecase";
import { MarkNotificationReadUseCase } from "../../application/use-cases/notification/mark-notification-read.usecase";
import { ClearUserNotificationsUseCase } from "../../application/use-cases/notification/clear-user-notifications.usecase";
import { logger } from "../../infrastructure/di/container";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class NotificationController {
    constructor(
        @inject(GetUserNotificationsUseCase) private _getUserNotificationsUseCase: GetUserNotificationsUseCase,
        @inject(MarkNotificationReadUseCase) private _markNotificationReadUseCase: MarkNotificationReadUseCase,
        @inject(ClearUserNotificationsUseCase) private _clearUserNotificationsUseCase: ClearUserNotificationsUseCase
    ) {}

    getNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        res.status(401).json({ success: false, message: 'Unauthorized' });
                        return;
                    }
        const notifications = await this._getUserNotificationsUseCase.execute({userId});
        res.status(200).json({ success: true, data: notifications });
        });

    markAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        await this._markNotificationReadUseCase.execute({action: 'single', id: id as string});
        res.status(200).json({ success: true, message: 'Notification marked as read' });
        });

    markAllAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        res.status(401).json({ success: false, message: 'Unauthorized' });
                        return;
                    }
        await this._markNotificationReadUseCase.execute({action: 'all', userId});
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
        });

    clearAll = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        res.status(401).json({ success: false, message: 'Unauthorized' });
                        return;
                    }
        await this._clearUserNotificationsUseCase.execute({ userId });
        res.status(200).json({ success: true, message: 'All notifications cleared' });
        });
}
