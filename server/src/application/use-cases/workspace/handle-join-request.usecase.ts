import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { AppError } from "../../../domain/errors/AppError";
import { WorkspaceMemberResponseDto } from "../../dtos/workspace/response/workspace-member.response.dto";

import { IHandleJoinRequestUseCase } from "../../interfaces/use-cases/workspace/handle-join-request.usecase.interface";
import { CreateNotificationUseCase } from "../notification/create-notification.usecase";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class HandleJoinRequestUseCase implements IHandleJoinRequestUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(CreateNotificationUseCase) private _createNotificationUseCase?: CreateNotificationUseCase
    ) {}

    async execute(payload: {workspaceId: string, requestUserId: string, action: 'approve' | 'reject', targetUserId: string}): Promise<WorkspaceMemberResponseDto | { message: string }> {
        const { workspaceId, requestUserId, action, targetUserId } = payload;
        if (!workspaceId || !targetUserId || !action) {
            throw new AppError(ErrorMessage.MISSING_REQUIRED_FIELDS, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (workspace.createdBy !== requestUserId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.FORBIDDEN);
        }

        const targetMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);

        if (!targetMember) {
            throw new AppError(ErrorMessage.MEMBER_NOT_FOUND_IN_WORKSPACE, HttpStatusCode.NOT_FOUND);
        }

        if (targetMember.status !== MemberStatus.PENDING) {
            throw new AppError(ErrorMessage.MEMBER_NOT_PENDING, HttpStatusCode.BAD_REQUEST);
        }

        if (action === 'approve') {
            const currentMembersCount = await this._workspaceMemberRepository.countMembersInWorkspace(workspaceId);

            if (currentMembersCount >= workspace.maxMembers) {
                throw new AppError(ErrorMessage.WORKSPACE_FULL, HttpStatusCode.BAD_REQUEST);
            }

            const updatedMember = await this._workspaceMemberRepository.updateStatus(workspaceId, targetUserId, MemberStatus.APPROVED);

            if (this._createNotificationUseCase) {
                await this._createNotificationUseCase.execute({
                    userId: targetUserId,
                    type: 'JOIN_REQUEST_APPROVED',
                    title: 'Join Request Approved',
                    message: `Your request to join the workspace "${workspace.name}" has been approved.`,
                    relatedId: workspaceId
                });
            }

            return {
                id: updatedMember!.id as string,
                workspaceId: updatedMember!.workspaceId,
                userId: updatedMember!.userId,
                role: updatedMember!.role,
                status: updatedMember!.status,
                joinedAt: updatedMember!.joinedAt as Date
            };
        } else if (action === 'reject') {
            await this._workspaceMemberRepository.remove(workspaceId, targetUserId);
            return { message: "Request rejected successfully" };
        } else {
            throw new AppError(ErrorMessage.INVALID_ACTION, HttpStatusCode.BAD_REQUEST);
        }
    }
}
