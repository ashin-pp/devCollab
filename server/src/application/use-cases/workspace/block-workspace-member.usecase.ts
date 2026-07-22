import { inject, injectable } from 'tsyringe';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { AppError } from "../../../domain/errors/AppError";
import { WorkspaceMemberResponseDto } from "../../dtos/workspace/response/workspace-member.response.dto";
import { IBlockWorkspaceMemberUseCase } from "../../interfaces/use-cases/workspace/block-workspace-member.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class BlockWorkspaceMemberUseCase implements IBlockWorkspaceMemberUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, ownerId: string, targetUserId: string}): Promise<WorkspaceMemberResponseDto> {
        const { workspaceId, ownerId, targetUserId } = payload;
        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        if (ownerId === targetUserId) {
            throw new AppError(ErrorMessage.CANNOT_BLOCK_OWNER, HttpStatusCode.BAD_REQUEST);
        }

        const targetMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
        if (!targetMember) {
            throw new AppError(ErrorMessage.TARGET_NOT_IN_WORKSPACE, HttpStatusCode.NOT_FOUND);
        }

        targetMember.block();

        const updatedMember = await this._workspaceMemberRepository.updateStatus(workspaceId, targetUserId, targetMember.status);
        if (!updatedMember) {
            throw new AppError(ErrorMessage.FAILED_TO_BLOCK_MEMBER, HttpStatusCode.INTERNAL_SERVER);
        }

        return {
            id: updatedMember.id as string,
            workspaceId: updatedMember.workspaceId,
            userId: updatedMember.userId,
            role: updatedMember.role,
            status: updatedMember.status,
            joinedAt: updatedMember.joinedAt as Date
        };
    }
}
