import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { MarkNotificationReadRequestDto } from "../../dtos/notification/request/mark-notification-read.dto";

@injectable()
export class MarkNotificationReadUseCase implements IBaseUseCase<MarkNotificationReadRequestDto, void> {
    constructor(
        @inject(TOKENS.INotificationRepository) private _notificationRepository: INotificationRepository
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
