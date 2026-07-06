import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { Workspace } from "../../../domain/entities/workspace.entity";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { CreateWorkspaceRequestDto } from "../../dtos/workspace/request/create-workspace.dto";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";
import { MemberRole } from "../../../domain/enums/MemberRole";
import crypto from "crypto";

@injectable()
export class CreateWorkspaceUseCase implements IBaseUseCase<CreateWorkspaceRequestDto, WorkspaceResponseDto> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) { }

    async execute(payload: CreateWorkspaceRequestDto): Promise<WorkspaceResponseDto> {
        if (!payload.name || !payload.createdBy) {
            throw new AppError(ErrorMessage.WORKSPACE_NAME_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        const newWorkspace = new Workspace(
            payload.name,
            inviteCode,
            payload.createdBy,
            payload.description,
            payload.logo,
            (payload.privacy as WorkspacePrivacy) ?? WorkspacePrivacy.PRIVATE,
            payload.maxMembers
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
