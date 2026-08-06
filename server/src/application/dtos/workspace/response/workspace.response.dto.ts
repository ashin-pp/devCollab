import { WorkspacePrivacy } from "../../../../domain/enums/WorkspacePrivacy";

export interface WorkspaceResponseDto {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    inviteCode: string;
    createdBy: string;
    privacy: WorkspacePrivacy;
    maxMembers: number;
    isActive: boolean;
    aiAssistantEnabled?: boolean;
    /** Plan assigned to the workspace owner (drives workspace entitlements). */
    ownerPlanName?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
