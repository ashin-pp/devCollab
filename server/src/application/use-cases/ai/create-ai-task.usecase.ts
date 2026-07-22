import { inject, injectable } from 'tsyringe';
import type { IAITaskRepository } from "../../../application/interfaces/repositories/ai-task.repository.interface";
import { AITask } from "../../../domain/entities/ai-task.entity";
import { AITaskStatus } from "../../../domain/enums/AITaskStatus";
import { ICreateAITaskUseCase } from "../../interfaces/use-cases/ai/create-ai-task.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class CreateAITaskUseCase implements ICreateAITaskUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAITaskRepository) private _aiTaskRepository: IAITaskRepository
    ) {}

    async execute(data: { workspaceId: string; channelId: string; title: string; description: string; assignedTo: string; dueDate: string }): Promise<void> {
        // We will default the agentId and createdBy to a placeholder or extract it properly.
        // For simplicity, we assume the AI is the agent creating it.
        const newTask: Partial<AITask> = {
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            title: data.title,
            description: data.description,
            assignedTo: data.assignedTo,
            dueDate: new Date(data.dueDate),
            status: AITaskStatus.OPEN,
            agentId: "000000000000000000000000", // placeholder or system AI agent id
            createdBy: "000000000000000000000000" 
        };

        await this._aiTaskRepository.create(newTask);
    }
}
