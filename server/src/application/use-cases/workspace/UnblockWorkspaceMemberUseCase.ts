import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { WorkspaceMember } from "../../../domain/entities/WorkspaceMember";

export class UnblockWorkspaceMemberUseCase {
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
        if (!ownerMember || ownerMember.role !== 'owner') {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        if (ownerId === targetUserId) {
            throw new AppError("Cannot unblock the owner of the workspace", HttpStatusCode.BAD_REQUEST);
        }

        const targetMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
        if (!targetMember) {
            throw new AppError("Target user is not a member of this workspace", HttpStatusCode.NOT_FOUND);
        }

        const updatedMember = await this.workspaceMemberRepository.updateStatus(workspaceId, targetUserId, 'approved');
        if (!updatedMember) {
            throw new AppError("Failed to unblock member", HttpStatusCode.INTERNAL_SERVER);
        }

        return updatedMember;
    }
}
