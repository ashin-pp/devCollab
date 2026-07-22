import { inject, injectable } from 'tsyringe';
import type { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";
import { MarkNotificationReadRequestDto } from "../../dtos/notification/request/mark-notification-read.dto";
import { IMarkNotificationReadUseCase } from "../../interfaces/use-cases/notification/mark-notification-read.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.INotificationRepository) private _notificationRepository: INotificationRepository
    ) {}

    async execute(payload: MarkNotificationReadRequestDto): Promise<void> {
        const { action, id, userId } = payload;
        if (action === 'single' && id) {
            await this._notificationRepository.markAsRead(id);
        } else if (action === 'all' && userId) {
            await this._notificationRepository.markAllAsRead(userId);
        }
    }
}
