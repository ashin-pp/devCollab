import { User } from "../../../../domain/entities/user.entity";
import { PaginationQueryParamsRequestDto } from "../../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../../dtos/common/response/paginated-response.dto";

export interface IGetAllUsersUseCase {
    execute(params: PaginationQueryParamsRequestDto): Promise<PaginatedResponseDto<User>>;
}
