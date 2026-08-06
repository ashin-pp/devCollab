import { Plan } from "../../domain/entities/plan.entity";
import { ProfilePlanSnapshotDto } from "../dtos/user/response/user-profile.response.dto";

export function toProfilePlanSnapshot(plan: Plan): ProfilePlanSnapshotDto {
    return {
        id: plan.id as string,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        durationDays: plan.durationDays,
        maxWorkspaces: plan.maxWorkspaces,
        maxMembersPerWorkspace: plan.maxMembersPerWorkspace,
        messageRetentionDays: plan.messageRetentionDays,
        aiAssistantEnabled: plan.aiAssistantEnabled,
        videoCallsEnabled: plan.videoCallsEnabled,
        multiAiAgents: plan.multiAiAgents,
        pinBoardEnabled: plan.pinBoardEnabled,
        isActive: plan.isActive,
    };
}
