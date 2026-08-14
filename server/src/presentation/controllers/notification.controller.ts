import { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IClearUserNotificationsUseCase } from "../../application/interfaces/use-cases/notification/clear-user-notifications.usecase.interface";
import type { IGetUserNotificationsUseCase } from "../../application/interfaces/use-cases/notification/get-user-notifications.usecase.interface";
import type { IMarkNotificationReadUseCase } from "../../application/interfaces/use-cases/notification/mark-notification-read.usecase.interface";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";
import { requireUserId } from "../utils/require-user-id";

@injectable()
export class NotificationController {
    constructor(
        @inject(USECASE_TOKENS.IGetUserNotificationsUseCase)
        private readonly _getUserNotificationsUseCase: IGetUserNotificationsUseCase,
        @inject(USECASE_TOKENS.IMarkNotificationReadUseCase)
        private readonly _markNotificationReadUseCase: IMarkNotificationReadUseCase,
        @inject(USECASE_TOKENS.IClearUserNotificationsUseCase)
        private readonly _clearUserNotificationsUseCase: IClearUserNotificationsUseCase
    ) {}

    getNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const notifications = await this._getUserNotificationsUseCase.execute({ userId });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.NOTIFICATIONS_FETCHED, notifications)
        );
    });

    markAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.params;
        await this._markNotificationReadUseCase.execute({ action: "single", id: id as string });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.NOTIFICATION_MARKED_READ)
        );
    });

    markAllAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        await this._markNotificationReadUseCase.execute({ action: "all", userId });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.NOTIFICATIONS_MARKED_READ)
        );
    });

    clearAll = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        await this._clearUserNotificationsUseCase.execute({ userId });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.NOTIFICATIONS_CLEARED)
        );
    });
}
