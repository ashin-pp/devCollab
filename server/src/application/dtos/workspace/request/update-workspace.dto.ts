import { WorkspacePrivacy } from "../../../../domain/enums/WorkspacePrivacy";

export interface UpdateWorkspaceRequestDto {
    workspaceId: string;
    ownerId: string;
    data: {
        name?: string;
        description?: string;
        privacy?: WorkspacePrivacy;
        logo?: string;
        maxMembers?: number;
    };
}
