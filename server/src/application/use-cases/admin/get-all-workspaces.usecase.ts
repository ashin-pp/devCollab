import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { PaginationQueryParamsRequestDto } from "../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../dtos/common/response/paginated-response.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

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
}

@injectable()
export class GetAllWorkspacesUseCase implements IBaseUseCase<{params: PaginationQueryParamsRequestDto}, PaginatedResponseDto<WorkspaceDetails>> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
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
        
        const workspacesWithDetails = await Promise.all(workspaces.map(async (workspace: any) => {
            const memberCount = await this._workspaceMemberRepository.countMembersInWorkspace(workspace.id!);
            const owner = await this._userRepository.findById(workspace.createdBy);
            
            return {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                privacy: workspace.privacy,
                isActive: workspace.isActive,
                maxMembers: workspace.maxMembers,
                createdAt: workspace.createdAt as Date,
                memberCount,
                ownerName: owner?.name || 'Unknown',
                ownerEmail: owner?.email || 'Unknown'
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
}
