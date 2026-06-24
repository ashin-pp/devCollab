import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { WorkspaceMember } from "../../../domain/entities/WorkspaceMember";
import { MemberRole } from "../../../domain/enums/MemberRole";

export class BlockWorkspaceMemberUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, ownerId: string, targetUserId: string): Promise<WorkspaceMember> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        if (ownerId === targetUserId) {
            throw new AppError(ErrorMessage.CANNOT_BLOCK_OWNER, HttpStatusCode.BAD_REQUEST);
        }

        const targetMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
        if (!targetMember) {
            throw new AppError(ErrorMessage.TARGET_NOT_IN_WORKSPACE, HttpStatusCode.NOT_FOUND);
        }

        targetMember.block();

        const updatedMember = await this.workspaceMemberRepository.updateStatus(workspaceId, targetUserId, targetMember.status);
        if (!updatedMember) {
            throw new AppError(ErrorMessage.FAILED_TO_BLOCK_MEMBER, HttpStatusCode.INTERNAL_SERVER);
        }

        return updatedMember;
    }
}
