import { WorkspaceMemberResponseDto } from "../../../dtos/workspace/response/workspace-member.response.dto";

export interface IBlockWorkspaceMemberUseCase {
    execute(payload: {workspaceId: string, ownerId: string, targetUserId: string}): Promise<WorkspaceMemberResponseDto>;
}
