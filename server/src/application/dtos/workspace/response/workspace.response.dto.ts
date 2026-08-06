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
    createdAt?: Date;
    updatedAt?: Date;
}
