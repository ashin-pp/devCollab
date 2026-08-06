import { PaginationQueryParamsRequestDto } from "../../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../../dtos/common/response/paginated-response.dto";

export interface AdminUserListItem {
    id?: string;
    name: string;
    email: string;
    profileImage?: string;
    status: string;
    subscriptionStatus: string;
    isVerified: boolean;
    planId?: string | null;
    planName: string;
    createdAt?: Date;
    lastSeen?: Date;
}

export interface IGetAllUsersUseCase {
    execute(params: PaginationQueryParamsRequestDto): Promise<PaginatedResponseDto<AdminUserListItem>>;
}
