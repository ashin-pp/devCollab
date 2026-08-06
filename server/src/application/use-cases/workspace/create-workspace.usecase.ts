import crypto from "crypto";
import { inject, injectable } from 'tsyringe';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { Workspace } from "../../../domain/entities/workspace.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";
import { AppError } from "../../../domain/errors/AppError";
import { CreateWorkspaceRequestDto } from "../../dtos/workspace/request/create-workspace.dto";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { ICreateWorkspaceUseCase } from "../../interfaces/use-cases/workspace/create-workspace.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { isValidWorkspaceName } from "../../../shared/utils/name-validation.util";

@injectable()
export class CreateWorkspaceUseCase implements ICreateWorkspaceUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) { }

    async execute(payload: CreateWorkspaceRequestDto): Promise<WorkspaceResponseDto> {
        const name = payload.name?.trim() ?? '';

        if (!name || !payload.createdBy) {
            throw new AppError(ErrorMessage.WORKSPACE_NAME_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        if (!isValidWorkspaceName(name)) {
            throw new AppError(ErrorMessage.WORKSPACE_NAME_INVALID, HttpStatusCode.BAD_REQUEST);
        }

        const entitlement = await this._planEntitlementService.assertSubscriptionActive(payload.createdBy);
        const ownedWorkspaces = await this._workspaceRepository.findAllByUserId(payload.createdBy);
        if (ownedWorkspaces.length >= entitlement.plan.maxWorkspaces) {
            throw new AppError(ErrorMessage.WORKSPACE_PLAN_LIMIT_REACHED, HttpStatusCode.FORBIDDEN);
        }

        const existing = await this._workspaceRepository.findByNameIgnoreCase(name);
        if (existing) {
            throw new AppError(ErrorMessage.WORKSPACE_NAME_EXISTS, HttpStatusCode.CONFLICT);
        }

        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const planMax = entitlement.plan.maxMembersPerWorkspace;

        if (
            payload.maxMembers !== undefined &&
            (!Number.isFinite(payload.maxMembers) || payload.maxMembers < 1 || payload.maxMembers > planMax)
        ) {
            throw new AppError(ErrorMessage.WORKSPACE_MEMBER_PLAN_LIMIT, HttpStatusCode.FORBIDDEN);
        }

        const maxMembers = payload.maxMembers ?? planMax;

        const newWorkspace = new Workspace(
            name,
            inviteCode,
            payload.createdBy,
            payload.description?.trim(),
            payload.logo,
            (payload.privacy as WorkspacePrivacy) ?? WorkspacePrivacy.PRIVATE,
            maxMembers
        );

        const createdWorkspace = await this._workspaceRepository.create(newWorkspace);

        if (!createdWorkspace.id) {
            throw new AppError(ErrorMessage.FAILED_TO_CREATE_WORKSPACE, HttpStatusCode.INTERNAL_SERVER);
        }

        const ownerMember = new WorkspaceMember(
            createdWorkspace.id,
            payload.createdBy,
            MemberRole.OWNER
        );

        await this._workspaceMemberRepository.create(ownerMember);

        return {
            id: createdWorkspace.id,
            name: createdWorkspace.name,
            description: createdWorkspace.description,
            logo: createdWorkspace.logo,
            inviteCode: createdWorkspace.inviteCode,
            createdBy: createdWorkspace.createdBy,
            privacy: createdWorkspace.privacy,
            maxMembers: createdWorkspace.maxMembers,
            isActive: createdWorkspace.isActive,
            createdAt: createdWorkspace.createdAt as Date,
            updatedAt: createdWorkspace.updatedAt as Date
        };
    }
}
