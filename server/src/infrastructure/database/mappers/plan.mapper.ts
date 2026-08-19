import { Plan } from "../../../domain/entities/plan.entity";
import { IMapper } from "../../../application/interfaces/IMapper";
import { IPlanModel } from "../models/plan.model";

export class PlanMapper implements IMapper<Plan, IPlanModel> {
    toDomain(persistence: IPlanModel): Plan {
        return new Plan(
            persistence.name,
            persistence.price,
            persistence.currency,
            persistence.duration_days,
            persistence.max_workspaces,
            persistence.max_members_per_workspace,
            persistence.message_retention_days,
            persistence.ai_assistant_enabled,
            persistence.video_calls_enabled,
            persistence.multi_ai_agents,
            persistence.pin_board_enabled,
            persistence.created_by.toString(),
            persistence.is_active,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<Plan>): Partial<IPlanModel> {
        const persistence: Partial<IPlanModel> = {
            name: domain.name,
            price: domain.price,
            currency: domain.currency,
            duration_days: domain.durationDays,
            max_workspaces: domain.maxWorkspaces,
            max_members_per_workspace: domain.maxMembersPerWorkspace,
            message_retention_days: domain.messageRetentionDays,
            ai_assistant_enabled: domain.aiAssistantEnabled,
            video_calls_enabled: domain.videoCallsEnabled,
            multi_ai_agents: domain.multiAiAgents,
            pin_board_enabled: domain.pinBoardEnabled,
            created_by: domain.createdBy as any,
            is_active: domain.isActive,
        };

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IPlanModel>;
    }
}
