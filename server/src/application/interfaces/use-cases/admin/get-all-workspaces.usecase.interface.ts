import { PaginationQueryParamsRequestDto } from "../../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../../dtos/common/response/paginated-response.dto";

export interface IGetAllWorkspacesUseCase {
    execute(payload: {params: PaginationQueryParamsRequestDto}): Promise<PaginatedResponseDto<WorkspaceDetails>>;
}

export interface WorkspaceDetails {
    id?: string;
    name: string;
    description: string | null;
    privacy: string;
    isActive: boolean;
    maxMembers: number;
    createdAt?: Date;
    memberCount: number;
    ownerName: string;
    ownerEmail: string;
    ownerPlanName: string;
    ownerPlanId?: string | null;
}
