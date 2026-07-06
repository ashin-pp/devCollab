import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import crypto from "crypto";

@injectable()
export class RegenerateInviteCodeUseCase implements IBaseUseCase<{workspaceId: string, ownerId: string}, WorkspaceResponseDto> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, ownerId: string}): Promise<WorkspaceResponseDto> {
        const { workspaceId, ownerId } = payload;
        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        const newInviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        const updatedWorkspace = await this._workspaceRepository.update(workspaceId, { inviteCode: newInviteCode });
        if (!updatedWorkspace) {
            throw new AppError(ErrorMessage.FAILED_TO_REGENERATE_INVITE_CODE, HttpStatusCode.INTERNAL_SERVER);
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
