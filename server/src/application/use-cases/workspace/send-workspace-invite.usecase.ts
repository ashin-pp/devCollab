import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IEmailService } from "../../../application/interfaces/services/email.service.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";
import { AppError } from "../../../domain/errors/AppError";
import { logger } from "../../../infrastructure/di/container";

import { ISendWorkspaceInviteUseCase } from "../../interfaces/use-cases/workspace/send-workspace-invite.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class SendWorkspaceInviteUseCase implements ISendWorkspaceInviteUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(SERVICE_TOKENS.IEmailService) private _emailService: IEmailService,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase
    ) {}

    async execute(payload: {workspaceId: string, requesterId: string, targetEmail: string}): Promise<{ success: boolean; message: string }> {
        const { workspaceId, requesterId, targetEmail } = payload;
        if (!workspaceId || !requesterId || !targetEmail) {
            throw new AppError(ErrorMessage.INVITE_FIELDS_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace || !workspace.id) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const requesterMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, requesterId);
        if (!requesterMember || requesterMember.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.NOT_APPROVED_WORKSPACE_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        if (workspace.privacy === WorkspacePrivacy.PRIVATE && requesterMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.ONLY_OWNER_CAN_INVITE_PRIVATE, HttpStatusCode.FORBIDDEN);
        }

        const targetUser = await this._userRepository.findByEmail(targetEmail.toLowerCase());
        if (!targetUser || !targetUser.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND_WITH_EMAIL, HttpStatusCode.NOT_FOUND);
        }

        const existingMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, targetUser.id);
        if (existingMember) {
            if (existingMember.status === MemberStatus.BLOCKED) {
                throw new AppError(ErrorMessage.MEMBER_BLOCKED_FROM_WORKSPACE, HttpStatusCode.BAD_REQUEST);
            }
            if (existingMember.status === MemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.MEMBER_ALREADY_IN_WORKSPACE, HttpStatusCode.BAD_REQUEST);
            }
            if (existingMember.status === MemberStatus.PENDING || existingMember.status === MemberStatus.INVITED) {
                await this._workspaceMemberRepository.updateStatus(workspace.id, targetUser.id, MemberStatus.INVITED);
            }
        } else {
            const newMember = new WorkspaceMember(
                workspace.id,
                targetUser.id,
                MemberRole.MEMBER,
                MemberStatus.INVITED,
                new Date()
            );
            await this._workspaceMemberRepository.create(newMember);
        }

        const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?inviteCode=${workspace.inviteCode}`;

        // In-app notification first so the invite still reaches them even if SMTP fails
        await this._createNotificationUseCase.execute({
            userId: targetUser.id,
            type: 'WORKSPACE_INVITE',
            title: 'Workspace Invitation',
            message: `You have been invited to join the workspace "${workspace.name}".`,
            relatedId: workspace.id
        }).catch(err => logger.error(`Failed to create invite notification: ${err instanceof Error ? err.message : String(err)}`));

        let emailSent = true;
        try {
            await this._emailService.sendWorkspaceInviteEmail(
                targetUser.email,
                workspace.name,
                inviteLink
            );
        } catch (error: unknown) {
            emailSent = false;
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Invite email failed for ${targetUser.email}, in-app invite still created: ${errorMessage}`);
        }

        return {
            success: true,
            message: emailSent
                ? "Invitation sent successfully"
                : "Invitation sent. The member will see it in their notifications."
        };
    }
}
