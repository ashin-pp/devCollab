import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { WorkspaceMemberResponseDto, MemberUserResponseDto, MemberUserFullProfileResponseDto } from "../../dtos/workspace/response/workspace-member-details.dto";
import { PaginationQueryParamsRequestDto } from "../../dtos/common/request/pagination-query-params.dto";
import { PaginatedResponseDto } from "../../dtos/common/response/paginated-response.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class GetWorkspaceMembersUseCase implements IBaseUseCase<{workspaceId: string, requestUserId: string, includeProfile?: boolean, params: PaginationQueryParamsRequestDto}, PaginatedResponseDto<WorkspaceMemberResponseDto>> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {workspaceId: string, requestUserId: string, includeProfile?: boolean, params: PaginationQueryParamsRequestDto}): Promise<PaginatedResponseDto<WorkspaceMemberResponseDto>> {
        const { workspaceId, requestUserId, includeProfile = false, params } = payload;
        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (!workspace.isActive) {
            throw new AppError(ErrorMessage.WORKSPACE_INACTIVE, HttpStatusCode.FORBIDDEN);
        }

        const currentMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
        if (currentMember?.status === MemberStatus.BLOCKED) {
            throw new AppError(ErrorMessage.MEMBER_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        const isOwner = workspace.createdBy === requestUserId;
        
        const page = params.page || 1;
        const limit = params.limit || 10;
        
        const query: Record<string, unknown> = { workspace_id: workspaceId };
        if (!isOwner) {
            query.status = MemberStatus.APPROVED;
        }

        let sort: Record<string, 1 | -1> | undefined;
        if (params.sortBy) {
            sort = { [params.sortBy]: params.sortOrder === 'desc' ? -1 : 1 };
        } else {
            sort = { joinedAt: -1 };
        }

        const { data: members, total } = await this._workspaceMemberRepository.findPaginated(query, page, limit, sort);

        const result: WorkspaceMemberResponseDto[] = await Promise.all(
            members.map(async (member): Promise<WorkspaceMemberResponseDto> => {
                const user = await this._userRepository.findById(member.userId);

                let userDTO: MemberUserResponseDto | MemberUserFullProfileResponseDto | null = null;

                if (user) {
                    if (includeProfile) {
                        userDTO = {
                            id: user.id as string,
                            name: user.name,
                            email: user.email,
                            profileImage: user.profileImage,
                            bio: user.bio,
                            skills: user.skills ?? [],
                            github: user.github,
                            linkedin: user.linkedin,
                            twitter: user.twitter,
                            location: user.location,
                            title: user.title,
                        } satisfies MemberUserFullProfileResponseDto;
                    } else {
                        userDTO = {
                            id: user.id as string,
                            name: user.name,
                            email: user.email,
                            profileImage: user.profileImage,
                        } satisfies MemberUserResponseDto;
                    }
                }

                return {
                    id: member.id,
                    workspaceId: member.workspaceId,
                    userId: member.userId,
                    role: member.role,
                    status: member.status,
                    joinedAt: member.joinedAt as Date,
                    user: userDTO,
                };
            })
        );

        return {
            data: result,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}
