import { CreateWorkspaceRequestDto } from "../../../dtos/workspace/request/create-workspace.dto";
import { WorkspaceResponseDto } from "../../../dtos/workspace/response/workspace.response.dto";

export interface ICreateWorkspaceUseCase {
    execute(payload: CreateWorkspaceRequestDto): Promise<WorkspaceResponseDto>;
}
