import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { User } from "../../../domain/entities/user.entity";
import { PaginationQueryParamsRequestDto } from "../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../dtos/common/response/paginated-response.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class GetAllUsersUseCase implements IBaseUseCase<PaginationQueryParamsRequestDto, PaginatedResponseDto<User>> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(params: PaginationQueryParamsRequestDto): Promise<PaginatedResponseDto<User>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        
        const query: Record<string, unknown> = {};
        if (params.search) {
            query.$or = [
                { name: { $regex: params.search, $options: 'i' } },
                { email: { $regex: params.search, $options: 'i' } }
            ];
        }
        
        if (params.filter) {
            if (params.filter === 'active') {
                query.status = 'active';
            } else if (params.filter === 'blocked') {
                query.status = 'blocked';
            }
        }
        
        let sort: Record<string, 1 | -1> | undefined;
        if (params.sortBy) {
            sort = { [params.sortBy]: params.sortOrder === 'desc' ? -1 : 1 };
        } else {
            sort = { createdAt: -1 };
        }

        const { data, total } = await this._userRepository.findPaginated(query, page, limit, sort);
        
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}
