import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberStatus } from "../../../domain/enums/MemberStatus";

import { CreateNotificationUseCase } from "../notification/CreateNotificationUseCase";

export class HandleJoinRequestUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository,
        private createNotificationUseCase?: CreateNotificationUseCase
    ) {}

    async execute(workspaceId: string, requestUserId: string, action: 'approve' | 'reject', targetUserId: string) {
        if (!workspaceId || !targetUserId || !action) {
            throw new AppError(ErrorMessage.MISSING_REQUIRED_FIELDS, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (workspace.createdBy !== requestUserId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.FORBIDDEN);
        }

        const targetMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);

        if (!targetMember) {
            throw new AppError(ErrorMessage.MEMBER_NOT_FOUND_IN_WORKSPACE, HttpStatusCode.NOT_FOUND);
        }

        if (targetMember.status !== MemberStatus.PENDING) {
            throw new AppError(ErrorMessage.MEMBER_NOT_PENDING, HttpStatusCode.BAD_REQUEST);
        }

        if (action === 'approve') {
            const currentMembersCount = await this.workspaceMemberRepository.countMembersInWorkspace(workspaceId);

            if (currentMembersCount >= workspace.maxMembers) {
                throw new AppError(ErrorMessage.WORKSPACE_FULL, HttpStatusCode.BAD_REQUEST);
            }

            const updatedMember = await this.workspaceMemberRepository.updateStatus(workspaceId, targetUserId, MemberStatus.APPROVED);

            if (this.createNotificationUseCase) {
                await this.createNotificationUseCase.execute({
                    userId: targetUserId,
                    type: 'JOIN_REQUEST_APPROVED',
                    title: 'Join Request Approved',
                    message: `Your request to join the workspace "${workspace.name}" has been approved.`,
                    relatedId: workspaceId
                });
            }

            return updatedMember;
        } else if (action === 'reject') {
            await this.workspaceMemberRepository.remove(workspaceId, targetUserId);
            return { message: "Request rejected successfully" };
        } else {
            throw new AppError(ErrorMessage.INVALID_ACTION, HttpStatusCode.BAD_REQUEST);
        }
    }
}
