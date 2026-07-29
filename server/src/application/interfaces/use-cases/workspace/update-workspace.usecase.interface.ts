import { UpdateWorkspaceRequestDto } from "../../../dtos/workspace/request/update-workspace.dto";
import { WorkspaceResponseDto } from "../../../dtos/workspace/response/workspace.response.dto";

export interface IUpdateWorkspaceUseCase {
    execute(payload: UpdateWorkspaceRequestDto): Promise<WorkspaceResponseDto>;
}
