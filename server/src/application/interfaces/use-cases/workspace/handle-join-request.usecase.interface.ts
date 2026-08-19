import { WorkspaceMemberResponseDto } from "../../../dtos/workspace/response/workspace-member.response.dto";

export interface IHandleJoinRequestUseCase {
    execute(payload: {workspaceId: string, requestUserId: string, action: 'approve' | 'reject', targetUserId: string}): Promise<WorkspaceMemberResponseDto | { message: string }>;
}
