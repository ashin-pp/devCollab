import { inject, injectable } from 'tsyringe';
import type { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";
import { Notification } from "../../../domain/entities/notification.entity";
import { SocketService } from "../../../infrastructure/socket/socket.service";

import { CreateNotificationRequestDto } from "../../dtos/notification/request/create-notification.dto";
import { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class CreateNotificationUseCase implements ICreateNotificationUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.INotificationRepository) private _notificationRepository: INotificationRepository
    ) {}

    async execute(payload: CreateNotificationRequestDto): Promise<Notification> {
        const notification = await this._notificationRepository.create({
            ...payload,
            isRead: false
        } as unknown as Notification);
        
        const socketService = SocketService.getInstance();
        if (socketService) {
            socketService.getIO().to(`user:${payload.userId}`).emit('new_notification', notification);
        }

        return notification;
    }
}
