import { AITask } from "../../../domain/entities/ai-task.entity";

export interface IAITaskRepository {
    create(task: Partial<AITask>): Promise<AITask>;
    findById(id: string): Promise<AITask | null>;
    findByWorkspace(workspaceId: string): Promise<AITask[]>;
    findByChannel(channelId: string): Promise<AITask[]>;
    update(id: string, updateData: Partial<AITask>): Promise<AITask | null>;
}
