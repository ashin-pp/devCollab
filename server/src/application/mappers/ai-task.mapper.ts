import { AITask } from "../../domain/entities/ai-task.entity";
import { AITaskResponseDto } from "../dtos/ai/response/ai-task.response.dto";

export function toAITaskResponseDto(task: AITask): AITaskResponseDto {
    return {
        id: task.id as string,
        title: task.title,
        status: task.status,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
    };
}
