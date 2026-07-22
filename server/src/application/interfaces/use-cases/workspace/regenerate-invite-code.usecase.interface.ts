import { WorkspaceResponseDto } from "../../../dtos/workspace/response/workspace.response.dto";

export interface IRegenerateInviteCodeUseCase {
    execute(payload: {workspaceId: string, ownerId: string}): Promise<WorkspaceResponseDto>;
}
