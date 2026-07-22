import { WorkspaceResponseDto } from "../../../dtos/workspace/response/workspace.response.dto";

export interface IGetPublicWorkspacesUseCase {
    execute(): Promise<WorkspaceResponseDto[]>;
}
