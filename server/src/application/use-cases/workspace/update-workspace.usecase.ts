import { inject, injectable } from 'tsyringe';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { AppError } from "../../../domain/errors/AppError";
import { UpdateWorkspaceRequestDto } from "../../dtos/workspace/request/update-workspace.dto";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IUpdateWorkspaceUseCase } from "../../interfaces/use-cases/workspace/update-workspace.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class UpdateWorkspaceUseCase implements IUpdateWorkspaceUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: UpdateWorkspaceRequestDto): Promise<WorkspaceResponseDto> {
        const { workspaceId, ownerId, data } = payload;
        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        const updatedWorkspace = await this._workspaceRepository.update(workspaceId, data);
        if (!updatedWorkspace) {
            throw new AppError(ErrorMessage.FAILED_TO_CREATE_WORKSPACE, HttpStatusCode.INTERNAL_SERVER);
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
