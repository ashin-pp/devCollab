import { INotificationRepository } from "../../repositories/INotificationRepository";

export class MarkNotificationReadUseCase {
    constructor(private notificationRepository: INotificationRepository) {}

    async execute(id: string): Promise<void> {
        await this.notificationRepository.markAsRead(id);
    }

    async executeAll(userId: string): Promise<void> {
        await this.notificationRepository.markAllAsRead(userId);
    }
}
