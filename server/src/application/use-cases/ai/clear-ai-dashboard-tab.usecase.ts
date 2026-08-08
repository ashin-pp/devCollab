import { inject, injectable } from "tsyringe";
import type { IAITaskRepository } from "../../interfaces/repositories/ai-task.repository.interface";
import type { IAIReminderRepository } from "../../interfaces/repositories/ai-reminder.repository.interface";
import type { IAIScheduleRepository } from "../../interfaces/repositories/ai-schedule.repository.interface";
import type { INotificationRepository } from "../../interfaces/repositories/notification.repository.interface";
import type {
    ClearAIDashboardTabDTO,
    ClearAIDashboardTabResult,
    IClearAIDashboardTabUseCase,
} from "../../interfaces/use-cases/ai/clear-ai-dashboard-tab.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class ClearAIDashboardTabUseCase implements IClearAIDashboardTabUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAITaskRepository)
        private readonly _aiTaskRepository: IAITaskRepository,
        @inject(REPOSITORY_TOKENS.IAIReminderRepository)
        private readonly _aiReminderRepository: IAIReminderRepository,
        @inject(REPOSITORY_TOKENS.IAIScheduleRepository)
        private readonly _aiScheduleRepository: IAIScheduleRepository,
        @inject(REPOSITORY_TOKENS.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository
    ) {}

    async execute(dto: ClearAIDashboardTabDTO): Promise<ClearAIDashboardTabResult> {
        let cleared = 0;

        switch (dto.tab) {
            case "tasks":
                cleared = await this._aiTaskRepository.clearDoneForUserInWorkspace(
                    dto.userId,
                    dto.workspaceId
                );
                break;
            case "reminders":
                cleared = await this._aiReminderRepository.clearForUserInWorkspace(
                    dto.userId,
                    dto.workspaceId
                );
                break;
            case "notifications":
                cleared = await this._notificationRepository.clearAiNotifiesForUserInWorkspace(
                    dto.userId,
                    dto.workspaceId
                );
                break;
            case "schedule":
                cleared = await this._aiScheduleRepository.clearPastForUserInWorkspace(
                    dto.userId,
                    dto.workspaceId
                );
                break;
        }

        return { tab: dto.tab, cleared };
    }
}
