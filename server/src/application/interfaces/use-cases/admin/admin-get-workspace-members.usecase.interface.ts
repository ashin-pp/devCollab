import { PaginationQueryParamsRequestDto } from "../../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../../dtos/common/response/paginated-response.dto";

export interface IAdminGetWorkspaceMembersUseCase {
    execute(payload: {workspaceId: string, params: PaginationQueryParamsRequestDto}): Promise<PaginatedResponseDto<WorkspaceMemberDetails>>;
}

export interface WorkspaceMemberDetails {
    id?: string;
    userId: string;
    role: string;
    status: string;
    joinedAt: Date;
    userName: string;
    userEmail: string;
    userAvatar: string | null;
}
