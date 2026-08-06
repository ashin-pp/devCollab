import { inject, injectable } from 'tsyringe';
import type { IPlanRepository } from "../../../application/interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { PaginationQueryParamsRequestDto } from "../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../dtos/common/response/paginated-response.dto";

import {
    AdminUserListItem,
    IGetAllUsersUseCase,
} from "../../interfaces/use-cases/admin/get-all-users.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetAllUsersUseCase implements IGetAllUsersUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private _planRepository: IPlanRepository
    ) { }

    async execute(params: PaginationQueryParamsRequestDto): Promise<PaginatedResponseDto<AdminUserListItem>> {
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
        const planNameById = new Map<string, string>();

        const users = await Promise.all(
            data.map(async (user) => {
                const planName = await this.resolvePlanName(user.planId, planNameById);
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    status: user.status,
                    subscriptionStatus: user.subscriptionStatus,
                    isVerified: user.isVerified,
                    planId: user.planId,
                    planName,
                    createdAt: user.createdAt,
                    lastSeen: user.lastSeen,
                };
            })
        );
        
        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    private async resolvePlanName(
        planId: string | null | undefined,
        cache: Map<string, string>
    ): Promise<string> {
        if (!planId) return 'No plan';
        const cached = cache.get(planId);
        if (cached) return cached;

        const plan = await this._planRepository.findById(planId);
        const name = plan?.name?.trim() || 'Unknown plan';
        cache.set(planId, name);
        return name;
    }
}
