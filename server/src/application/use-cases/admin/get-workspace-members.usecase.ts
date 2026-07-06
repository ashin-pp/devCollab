import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { PaginationQueryParamsRequestDto } from "../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../dtos/common/response/paginated-response.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

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

@injectable()
export class GetWorkspaceMembersUseCase implements IBaseUseCase<{workspaceId: string, params: PaginationQueryParamsRequestDto}, PaginatedResponseDto<WorkspaceMemberDetails>> {
    constructor(
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {workspaceId: string, params: PaginationQueryParamsRequestDto}): Promise<PaginatedResponseDto<WorkspaceMemberDetails>> {
        const { workspaceId, params } = payload;
        const page = params.page || 1;
        const limit = params.limit || 10;
        
        const query: Record<string, unknown> = { workspace_id: workspaceId };
        
        if (params.filter && params.filter !== 'ALL') {
            query.status = params.filter.toLowerCase();
        }
        
        let sort: Record<string, 1 | -1> | undefined;
        if (params.sortBy) {
            sort = { [params.sortBy]: params.sortOrder === 'desc' ? -1 : 1 };
        } else {
            sort = { joinedAt: -1 };
        }

        const { data: members, total } = await this._workspaceMemberRepository.findPaginated(query, page, limit, sort);
        
        const populatedMembers = await Promise.all(members.map(async (member) => {
            const user = await this._userRepository.findById(member.userId);
            return {
                id: member.id,
                userId: member.userId,
                role: member.role,
                status: member.status,
                joinedAt: member.joinedAt as Date,
                userName: user?.name || 'Unknown',
                userEmail: user?.email || 'Unknown',
                userAvatar: user?.profileImage || null
            };
        }));

        // Search is handled in memory here for simplicity if needed, or we would need to join collections.
        // For now, returning paginated members without name search, since name is in User collection.
        // If search is required, a Mongo aggregate is better. We'll skip search for members here for now.

        return {
            data: populatedMembers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}
