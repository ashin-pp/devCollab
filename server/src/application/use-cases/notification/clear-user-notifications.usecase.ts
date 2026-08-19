import { inject, injectable } from 'tsyringe';
import type { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";
import { IClearUserNotificationsUseCase } from "../../interfaces/use-cases/notification/clear-user-notifications.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class ClearUserNotificationsUseCase implements IClearUserNotificationsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.INotificationRepository) private _notificationRepository: INotificationRepository
    ) {}

    async execute(payload: { userId: string }): Promise<void> {
        await this._notificationRepository.deleteAll(payload.userId);
    }
}
