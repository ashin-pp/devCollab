import { inject, injectable } from 'tsyringe';
import type { IPlanRepository } from "../../../application/interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { PaginationQueryParamsRequestDto } from "../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../dtos/common/response/paginated-response.dto";

import {
    IGetAllWorkspacesUseCase,
    WorkspaceDetails,
} from "../../interfaces/use-cases/admin/get-all-workspaces.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetAllWorkspacesUseCase implements IGetAllWorkspacesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private _planRepository: IPlanRepository
    ) {}

    async execute(payload: {params: PaginationQueryParamsRequestDto}): Promise<PaginatedResponseDto<WorkspaceDetails>> {
        const { params } = payload;
        const page = params.page || 1;
        const limit = params.limit || 10;
        
        const andConditions: Record<string, unknown>[] = [];

        if (params.search) {
            andConditions.push({ name: { $regex: params.search, $options: 'i' } });
        }

        if (params.filter === 'active') {
            andConditions.push({ is_active: true });
        } else if (params.filter === 'deactivated') {
            andConditions.push({ is_active: false });
        }

        if (params.planId === 'none' || params.planId) {
            const ownerIds = await this.findOwnerIdsByPlan(params.planId);
            if (ownerIds.length === 0) {
                return { data: [], total: 0, page, limit, totalPages: 0 };
            }
            andConditions.push({ created_by: { $in: ownerIds } });
        }

        const query: Record<string, unknown> =
            andConditions.length > 0 ? { $and: andConditions } : {};
        
        let sort: Record<string, 1 | -1> | undefined;
        if (params.sortBy) {
            const sortField =
                params.sortBy === 'createdAt' ? 'created_at'
                : params.sortBy === 'name' ? 'name'
                : params.sortBy === 'privacy' ? 'privacy'
                : params.sortBy === 'isActive' ? 'is_active'
                : params.sortBy;
            sort = { [sortField]: params.sortOrder === 'desc' ? -1 : 1 };
        } else {
            sort = { created_at: -1 };
        }

        const { data: workspaces, total } = await this._workspaceRepository.findPaginated(query, page, limit, sort);
        const planNameById = await this.buildPlanNameMap();

        const workspacesWithDetails = await Promise.all(workspaces.map(async (workspace) => {
            const memberCount = await this._workspaceMemberRepository.countMembersInWorkspace(workspace.id!);
            const owner = await this._userRepository.findById(workspace.createdBy);
            
            return {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description ?? null,
                privacy: workspace.privacy,
                isActive: workspace.isActive,
                maxMembers: workspace.maxMembers,
                createdAt: workspace.createdAt as Date,
                memberCount,
                ownerName: owner?.name || 'Unknown',
                ownerEmail: owner?.email || 'Unknown',
                ownerPlanName: this.resolvePlanName(owner?.planId, planNameById),
                ownerPlanId: owner?.planId ?? null,
            };
        }));

        return {
            data: workspacesWithDetails,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    private async findOwnerIdsByPlan(planId: string): Promise<string[]> {
        const planQuery =
            planId === 'none'
                ? { $or: [{ plan_id: null }, { plan_id: { $exists: false } }] }
                : { plan_id: planId };

        const { data } = await this._userRepository.findPaginated(planQuery, 1, 10_000);
        return data.map((user) => user.id).filter((id): id is string => Boolean(id));
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
