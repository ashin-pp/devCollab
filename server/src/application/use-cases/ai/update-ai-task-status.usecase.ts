import { inject, injectable } from "tsyringe";
import type { IAITaskRepository } from "../../interfaces/repositories/ai-task.repository.interface";
import type {
    IUpdateAITaskStatusUseCase,
    UpdateAITaskStatusDTO,
} from "../../interfaces/use-cases/ai/update-ai-task-status.usecase.interface";
import { AITask } from "../../../domain/entities/ai-task.entity";
import { AITaskStatus } from "../../../domain/enums/AITaskStatus";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class UpdateAITaskStatusUseCase implements IUpdateAITaskStatusUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAITaskRepository)
        private readonly _aiTaskRepository: IAITaskRepository
    ) {}

    async execute(dto: UpdateAITaskStatusDTO): Promise<AITask> {
        const task = await this._aiTaskRepository.findById(dto.taskId);
        if (!task || task.workspaceId !== dto.workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const isAssignee = task.assignedTo === dto.userId;
        const isCreator = task.createdBy === dto.userId;
        if (!isAssignee && !isCreator) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.FORBIDDEN);
        }

        const status = Object.values(AITaskStatus).includes(dto.status)
            ? dto.status
            : AITaskStatus.DONE;

        const updated = await this._aiTaskRepository.update(dto.taskId, { status });
        if (!updated) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        return updated;
    }
}
