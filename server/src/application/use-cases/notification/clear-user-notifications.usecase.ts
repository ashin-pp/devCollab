import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class ClearUserNotificationsUseCase implements IBaseUseCase<{ userId: string }, void> {
    constructor(
        @inject(TOKENS.INotificationRepository) private _notificationRepository: INotificationRepository
    ) {}

    async execute(payload: { userId: string }): Promise<void> {
        await this._notificationRepository.deleteAll(payload.userId);
    }
}
