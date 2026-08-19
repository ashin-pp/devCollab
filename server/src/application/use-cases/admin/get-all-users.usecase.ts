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
        
        const andConditions: Record<string, unknown>[] = [];

        if (params.search) {
            andConditions.push({
                $or: [
                    { name: { $regex: params.search, $options: 'i' } },
                    { email: { $regex: params.search, $options: 'i' } }
                ]
            });
        }
        
        if (params.filter === 'active') {
            andConditions.push({ status: 'active' });
        } else if (params.filter === 'blocked') {
            andConditions.push({ status: 'blocked' });
        }

        if (params.planId === 'none') {
            andConditions.push({
                $or: [{ plan_id: null }, { plan_id: { $exists: false } }]
            });
        } else if (params.planId) {
            andConditions.push({ plan_id: params.planId });
        }

        const query: Record<string, unknown> =
            andConditions.length > 0 ? { $and: andConditions } : {};
        
        let sort: Record<string, 1 | -1> | undefined;
        if (params.sortBy) {
            const sortField =
                params.sortBy === 'createdAt' ? 'created_at'
                : params.sortBy === 'status' ? 'status'
                : params.sortBy === 'name' ? 'name'
                : params.sortBy;
            sort = { [sortField]: params.sortOrder === 'desc' ? -1 : 1 };
        } else {
            sort = { created_at: -1 };
        }

        const { data, total } = await this._userRepository.findPaginated(query, page, limit, sort);
        const planNameById = await this.buildPlanNameMap();

        const users = data.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            status: user.status,
            subscriptionStatus: user.subscriptionStatus,
            isVerified: user.isVerified,
            planId: user.planId ?? null,
            planName: this.resolvePlanName(user.planId, planNameById),
            createdAt: user.createdAt,
            lastSeen: user.lastSeen,
        }));
        
        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    private async buildPlanNameMap(): Promise<Map<string, string>> {
        const plans = await this._planRepository.findAll();
        const map = new Map<string, string>();
        for (const plan of plans) {
            if (plan.id) {
                map.set(plan.id, plan.name.trim() || 'Unknown plan');
            }
        }
        return map;
    }

    private resolvePlanName(
        planId: string | null | undefined,
        planNameById: Map<string, string>
    ): string {
        if (!planId) return 'No plan';
        return planNameById.get(planId) ?? 'Unknown plan';
    }
}
