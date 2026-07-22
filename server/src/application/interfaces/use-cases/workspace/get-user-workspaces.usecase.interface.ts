import { WorkspaceResponseDto } from "../../../dtos/workspace/response/workspace.response.dto";

export interface IGetUserWorkspacesUseCase {
    execute(payload: { userId: string }): Promise<(WorkspaceResponseDto & { memberStatus: string })[]>;
}
