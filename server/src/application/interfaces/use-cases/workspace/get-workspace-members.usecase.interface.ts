import { PaginationQueryParamsRequestDto } from "../../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../../dtos/common/response/paginated-response.dto";
import { WorkspaceMemberResponseDto } from "../../../dtos/workspace/response/workspace-member-details.dto";

export interface IGetWorkspaceMembersUseCase {
    execute(payload: {workspaceId: string, requestUserId: string, includeProfile?: boolean, params: PaginationQueryParamsRequestDto}): Promise<PaginatedResponseDto<WorkspaceMemberResponseDto>>;
}
