import { inject, injectable } from 'tsyringe';
import type { IAITaskRepository } from "../../../application/interfaces/repositories/ai-task.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { AITask } from "../../../domain/entities/ai-task.entity";
import { AITaskStatus } from "../../../domain/enums/AITaskStatus";
import { NotificationTitle } from "../../../domain/enums/NotificationMessage";
import { ICreateAITaskUseCase } from "../../interfaces/use-cases/ai/create-ai-task.usecase.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { formatAiDateTimeForUser, normalizeAiDateTime } from "../../../infrastructure/ai/utils/datetime.utils";

const SYSTEM_AGENT_ID = "000000000000000000000000";

@injectable()
export class CreateAITaskUseCase implements ICreateAITaskUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAITaskRepository) private _aiTaskRepository: IAITaskRepository,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository
    ) {}

    async execute(data: {
        workspaceId: string;
        channelId: string;
        title: string;
        description: string;
        assignedTo: string;
        dueDate: string;
        createdBy: string;
    }): Promise<void> {
        const dueDate = normalizeAiDateTime(data.dueDate);

        const newTask: Partial<AITask> = {
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            title: data.title,
            description: data.description,
            assignedTo: data.assignedTo,
            dueDate,
            status: AITaskStatus.OPEN,
            agentId: SYSTEM_AGENT_ID,
            createdBy: data.createdBy,
        };

        await this._aiTaskRepository.create(newTask);

        const creator = await this._userRepository.findById(data.createdBy);
        const channel = await this._channelRepository.findById(data.channelId);
        const dueLabel = Number.isNaN(dueDate.getTime())
            ? "no due date"
            : formatAiDateTimeForUser(dueDate);

        const who =
            creator && channel
                ? `@${creator.name} in #${channel.name}`
                : creator
                  ? `@${creator.name}`
                  : "Someone";

        const message =
            data.assignedTo === data.createdBy
                ? `${who} created a task for you: "${data.title}" (due ${dueLabel})`
                : `${who} assigned you a task: "${data.title}" (due ${dueLabel})`;

        await this._createNotificationUseCase.execute({
            userId: data.assignedTo,
            type: "GENERAL",
            title: NotificationTitle.AI_TASK_ASSIGNED,
            message,
            relatedId: data.workspaceId,
            actorId: data.createdBy,
        });
    }
}
