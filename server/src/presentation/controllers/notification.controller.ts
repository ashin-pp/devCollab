import { NextFunction, Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IClearUserNotificationsUseCase } from "../../application/interfaces/use-cases/notification/clear-user-notifications.usecase.interface";
import type { IGetUserNotificationsUseCase } from "../../application/interfaces/use-cases/notification/get-user-notifications.usecase.interface";
import type { IMarkNotificationReadUseCase } from "../../application/interfaces/use-cases/notification/mark-notification-read.usecase.interface";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class NotificationController {
    constructor(
        @inject(USECASE_TOKENS.IGetUserNotificationsUseCase) private _getUserNotificationsUseCase: IGetUserNotificationsUseCase,
        @inject(USECASE_TOKENS.IMarkNotificationReadUseCase) private _markNotificationReadUseCase: IMarkNotificationReadUseCase,
        @inject(USECASE_TOKENS.IClearUserNotificationsUseCase) private _clearUserNotificationsUseCase: IClearUserNotificationsUseCase
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
