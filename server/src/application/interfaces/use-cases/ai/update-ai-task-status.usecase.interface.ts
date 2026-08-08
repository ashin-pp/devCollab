import { AITaskStatus } from "../../../../domain/enums/AITaskStatus";
import { AITaskResponseDto } from "../../../dtos/ai/response/ai-task.response.dto";

export interface UpdateAITaskStatusDTO {
    taskId: string;
    userId: string;
    workspaceId: string;
    status: AITaskStatus;
}

export interface IUpdateAITaskStatusUseCase {
    execute(dto: UpdateAITaskStatusDTO): Promise<AITaskResponseDto>;
}
