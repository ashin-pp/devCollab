import { inject, injectable } from 'tsyringe';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { AppError } from "../../../domain/errors/AppError";
import { UpdateWorkspaceRequestDto } from "../../dtos/workspace/request/update-workspace.dto";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IUpdateWorkspaceUseCase } from "../../interfaces/use-cases/workspace/update-workspace.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { isValidWorkspaceName } from "../../../shared/utils/name-validation.util";

@injectable()
export class UpdateWorkspaceUseCase implements IUpdateWorkspaceUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: UpdateWorkspaceRequestDto): Promise<WorkspaceResponseDto> {
        const { workspaceId, ownerId } = payload;
        let { data } = payload;

        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        if (data.name !== undefined) {
            const name = data.name.trim();
            if (!isValidWorkspaceName(name)) {
                throw new AppError(ErrorMessage.WORKSPACE_NAME_INVALID, HttpStatusCode.BAD_REQUEST);
            }

            const existing = await this._workspaceRepository.findByNameIgnoreCase(name);
            if (existing && existing.id !== workspaceId) {
                throw new AppError(ErrorMessage.WORKSPACE_NAME_EXISTS, HttpStatusCode.CONFLICT);
            }

            data = { ...data, name };
        }

        if (data.maxMembers !== undefined) {
            if (!Number.isFinite(data.maxMembers) || data.maxMembers < 1) {
                throw new AppError(ErrorMessage.WORKSPACE_MEMBER_PLAN_LIMIT, HttpStatusCode.BAD_REQUEST);
            }

            const entitlement = await this._planEntitlementService.assertSubscriptionActive(ownerId);
            const planMax = entitlement.plan.maxMembersPerWorkspace;

            if (data.maxMembers > planMax) {
                throw new AppError(ErrorMessage.WORKSPACE_MEMBER_PLAN_LIMIT, HttpStatusCode.FORBIDDEN);
            }

            const { total: approvedCount } = await this._workspaceMemberRepository.findPaginated(
                { workspace_id: workspaceId, status: 'approved' },
                1,
                1
            );

            if (data.maxMembers < approvedCount) {
                throw new AppError(ErrorMessage.WORKSPACE_MAX_MEMBERS_BELOW_CURRENT, HttpStatusCode.BAD_REQUEST);
            }

            data = { ...data, maxMembers: data.maxMembers };
        }

        const updatedWorkspace = await this._workspaceRepository.update(workspaceId, data);
        if (!updatedWorkspace) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_WORKSPACE, HttpStatusCode.INTERNAL_SERVER);
        }

        return {
            id: updatedWorkspace.id as string,
            name: updatedWorkspace.name,
            description: updatedWorkspace.description,
            logo: updatedWorkspace.logo,
            inviteCode: updatedWorkspace.inviteCode,
            createdBy: updatedWorkspace.createdBy,
            privacy: updatedWorkspace.privacy,
            maxMembers: updatedWorkspace.maxMembers,
            isActive: updatedWorkspace.isActive,
            createdAt: updatedWorkspace.createdAt as Date,
            updatedAt: updatedWorkspace.updatedAt as Date
        };
    }
}
