import { INotificationRepository } from "../../repositories/INotificationRepository";
import { Notification } from "../../../domain/entities/Notification";
import { SocketService } from "../../../infra/socket/SocketService";

export class CreateNotificationUseCase {
    constructor(private notificationRepository: INotificationRepository) {}

    async execute(data: {
        userId: string;
        type: 'POLL_CREATED' | 'JOIN_REQUEST_APPROVED' | 'WORKSPACE_INVITE' | 'GENERAL';
        title: string;
        message: string;
        relatedId?: string;
    }): Promise<Notification> {
        const notification = await this.notificationRepository.create({
            ...data,
            isRead: false
        } as unknown as Notification);
        
        // Emit socket event to the specific user's room
        const socketService = SocketService.getInstance();
        if (socketService) {
            socketService.getIO().to(`user:${data.userId}`).emit('new_notification', notification);
        }

        return notification;
    }
}
