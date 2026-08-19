import { JoinWorkspaceRequestDto } from "../../../dtos/workspace/request/join-workspace.dto";
import { WorkspaceMemberResponseDto } from "../../../dtos/workspace/response/workspace-member.response.dto";

export interface IJoinWorkspaceUseCase {
    execute(payload: JoinWorkspaceRequestDto): Promise<WorkspaceMemberResponseDto>;
}
