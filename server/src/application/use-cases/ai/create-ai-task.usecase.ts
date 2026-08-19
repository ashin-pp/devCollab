import { inject, injectable } from 'tsyringe';
import type { IAITaskRepository } from "../../../application/interfaces/repositories/ai-task.repository.interface";
import { AITask } from "../../../domain/entities/ai-task.entity";
import { AITaskStatus } from "../../../domain/enums/AITaskStatus";
import { ICreateAITaskUseCase } from "../../interfaces/use-cases/ai/create-ai-task.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

const SYSTEM_AGENT_ID = "000000000000000000000000";

@injectable()
export class CreateAITaskUseCase implements ICreateAITaskUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAITaskRepository) private _aiTaskRepository: IAITaskRepository
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
        const newTask: Partial<AITask> = {
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            title: data.title,
            description: data.description,
            assignedTo: data.assignedTo,
            dueDate: new Date(data.dueDate),
            status: AITaskStatus.OPEN,
            agentId: SYSTEM_AGENT_ID,
            createdBy: data.createdBy,
        };

        await this._aiTaskRepository.create(newTask);
    }
}
