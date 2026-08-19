import { AITaskStatus } from "../../../../domain/enums/AITaskStatus";

export interface AITaskResponseDto {
    id: string;
    title: string;
    status: AITaskStatus;
    assignedTo: string;
    createdBy: string;
}
