import { IAITaskRepository } from "../../repositories/IAITaskRepository";
import { AITask } from "../../../domain/entities/AITask";
import { AITaskStatus } from "../../../domain/enums/AITaskStatus";
import { ICreateTaskDependency } from "../../../infra/ai/tools/TaskTool";

export class CreateAITaskUseCase implements ICreateTaskDependency {
    constructor(private aiTaskRepository: IAITaskRepository) {}

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

        await this.aiTaskRepository.create(newTask);
    }
}
