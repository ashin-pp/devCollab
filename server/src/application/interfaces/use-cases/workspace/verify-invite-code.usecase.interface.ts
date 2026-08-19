import { WorkspaceResponseDto } from "../../../dtos/workspace/response/workspace.response.dto";

export interface IVerifyInviteCodeUseCase {
    execute(payload: { inviteCode: string }): Promise<Partial<WorkspaceResponseDto>>;
}
