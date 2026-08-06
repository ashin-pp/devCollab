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
        
        const query: Record<string, unknown> = {};
        if (params.search) {
            query.name = { $regex: params.search, $options: 'i' };
        }

        if (params.filter) {
            if (params.filter === 'active') {
                query.is_active = true;
            } else if (params.filter === 'deactivated') {
                query.is_active = false;
            }
        }
        
        let sort: Record<string, 1 | -1> | undefined;
        if (params.sortBy) {
            sort = { [params.sortBy]: params.sortOrder === 'desc' ? -1 : 1 };
        } else {
            sort = { createdAt: -1 };
        }

        const { data: workspaces, total } = await this._workspaceRepository.findPaginated(query, page, limit, sort);
        const planNameById = new Map<string, string>();

        const workspacesWithDetails = await Promise.all(workspaces.map(async (workspace) => {
            const memberCount = await this._workspaceMemberRepository.countMembersInWorkspace(workspace.id!);
            const owner = await this._userRepository.findById(workspace.createdBy);
            const ownerPlanName = await this.resolveOwnerPlanName(owner?.planId, planNameById);
            
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
                ownerPlanName,
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

    private async resolveOwnerPlanName(
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
