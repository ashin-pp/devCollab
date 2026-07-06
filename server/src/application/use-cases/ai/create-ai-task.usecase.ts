import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IAITaskRepository } from "../../../application/interfaces/repositories/ai-task.repository.interface";
import { AITask } from "../../../domain/entities/ai-task.entity";
import { AITaskStatus } from "../../../domain/enums/AITaskStatus";
@injectable()
export class CreateAITaskUseCase {
    constructor(
        @inject(TOKENS.IAITaskRepository) private _aiTaskRepository: IAITaskRepository
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
