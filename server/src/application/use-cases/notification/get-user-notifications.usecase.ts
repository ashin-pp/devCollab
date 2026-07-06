import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { NotificationResponseDto } from "../../dtos/notification/response/notification.response.dto";

@injectable()
export class GetUserNotificationsUseCase implements IBaseUseCase<{userId: string, unreadOnly?: boolean}, NotificationResponseDto[]> {
    constructor(
        @inject(TOKENS.INotificationRepository) private _notificationRepository: INotificationRepository
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
