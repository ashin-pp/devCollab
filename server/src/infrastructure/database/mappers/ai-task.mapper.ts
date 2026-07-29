import { AITask } from "../../../domain/entities/ai-task.entity";
import { IMapper } from "../../../application/interfaces/IMapper";
import { IAITaskModel } from "../models/ai-task.model";

export class AITaskMapper implements IMapper<AITask, IAITaskModel> {
    toDomain(persistence: IAITaskModel): AITask {
        return new AITask(
            persistence.workspace_id.toString(),
            persistence.channel_id.toString(),
            persistence.created_by.toString(),
            persistence.agent_id.toString(),
            persistence.title,
            persistence.description,
            persistence.assigned_to.toString(),
            persistence.due_date,
            persistence.status,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<AITask>): Partial<IAITaskModel> {
        const persistence: Partial<IAITaskModel> = {
            workspace_id: domain.workspaceId as any,
            channel_id: domain.channelId as any,
            created_by: domain.createdBy as any,
            agent_id: domain.agentId as any,
            title: domain.title,
            description: domain.description,
            assigned_to: domain.assignedTo as any,
            due_date: domain.dueDate,
            status: domain.status
        };

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IAITaskModel>;
    }
}
