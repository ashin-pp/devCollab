import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";
import { Notification } from "../../../domain/entities/notification.entity";
import { SocketService } from "../../../infrastructure/socket/socket.service";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { CreateNotificationRequestDto } from "../../dtos/notification/request/create-notification.dto";

@injectable()
export class CreateNotificationUseCase implements IBaseUseCase<CreateNotificationRequestDto, Notification> {
    constructor(
        @inject(TOKENS.INotificationRepository) private _notificationRepository: INotificationRepository
    ) {}

    async execute(payload: CreateNotificationRequestDto): Promise<Notification> {
        const notification = await this._notificationRepository.create({
            ...payload,
            isRead: false
        } as unknown as Notification);
        
        // Emit socket event to the specific user's room
        const socketService = SocketService.getInstance();
        if (socketService) {
            socketService.getIO().to(`user:${payload.userId}`).emit('new_notification', notification);
        }

        return notification;
    }
}
