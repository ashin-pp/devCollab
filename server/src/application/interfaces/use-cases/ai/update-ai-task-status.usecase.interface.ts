import { AITask } from "../../../../domain/entities/ai-task.entity";
import { AITaskStatus } from "../../../../domain/enums/AITaskStatus";

export interface UpdateAITaskStatusDTO {
    taskId: string;
    userId: string;
    workspaceId: string;
    status: AITaskStatus;
}

export interface IUpdateAITaskStatusUseCase {
    execute(dto: UpdateAITaskStatusDTO): Promise<AITask>;
}
