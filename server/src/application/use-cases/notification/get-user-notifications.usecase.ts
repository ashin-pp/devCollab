import { inject, injectable } from 'tsyringe';
import type { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";
import { NotificationResponseDto } from "../../dtos/notification/response/notification.response.dto";
import { IGetUserNotificationsUseCase } from "../../interfaces/use-cases/notification/get-user-notifications.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetUserNotificationsUseCase implements IGetUserNotificationsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.INotificationRepository) private _notificationRepository: INotificationRepository
    ) {}

    async execute(payload: {userId: string, unreadOnly?: boolean}): Promise<NotificationResponseDto[]> {
        const { userId, unreadOnly } = payload;
        const notifications = await this._notificationRepository.findByUserId(userId, unreadOnly);
        return notifications.map((notification: any) => ({
            id: notification.id as string,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            isRead: notification.isRead,
            relatedId: notification.relatedId,
            createdAt: notification.createdAt as Date,
            updatedAt: notification.updatedAt as Date
        }));
    }
}
