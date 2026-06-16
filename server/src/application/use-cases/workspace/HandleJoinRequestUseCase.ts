import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class HandleJoinRequestUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, requestUserId: string, action: 'approve' | 'reject', targetUserId: string) {
        if (!workspaceId || !targetUserId || !action) {
            throw new AppError("Missing required fields", HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError("Workspace not found", HttpStatusCode.NOT_FOUND);
        }

        // Verify the user attempting to handle the request is the owner of the workspace
        if (workspace.createdBy !== requestUserId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.FORBIDDEN);
        }

        const targetMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
        
        if (!targetMember) {
            throw new AppError("Member not found in workspace", HttpStatusCode.NOT_FOUND);
        }

        if (targetMember.status !== 'pending') {
            throw new AppError("User is not in pending status", HttpStatusCode.BAD_REQUEST);
        }

        if (action === 'approve') {
            const currentMembersCount = await this.workspaceMemberRepository.countMembersInWorkspace(workspaceId);
            
            if (currentMembersCount >= workspace.maxMembers) {
                throw new AppError(ErrorMessage.WORKSPACE_FULL, HttpStatusCode.BAD_REQUEST);
            }

            const updatedMember = await this.workspaceMemberRepository.updateStatus(workspaceId, targetUserId, 'approved');
            return updatedMember;
        } else if (action === 'reject') {
            await this.workspaceMemberRepository.remove(workspaceId, targetUserId);
            return { message: "Request rejected successfully" };
        } else {
            throw new AppError("Invalid action", HttpStatusCode.BAD_REQUEST);
        }
    }
}
