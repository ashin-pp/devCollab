import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IEmailService } from "../../../application/interfaces/services/email.service.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { SuccessMessage } from "../../../domain/enums/SuccessMessage";
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
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: {workspaceId: string, requesterId: string, targetEmail: string}): Promise<{ success: boolean; message: string }> {
        const { workspaceId, requesterId, targetEmail } = payload;
        if (!workspaceId || !requesterId || !targetEmail) {
            throw new AppError(ErrorMessage.INVITE_FIELDS_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        await this._planEntitlementService.resolveForUserId(requesterId);

        const normalizedEmail = targetEmail.toLowerCase().trim();

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

        const ownerEntitlement = await this._planEntitlementService.resolveForUserId(workspace.createdBy);
        const effectiveMaxMembers = Math.min(
            workspace.maxMembers,
            ownerEntitlement.plan.maxMembersPerWorkspace
        );
        const currentMembersCount = await this._workspaceMemberRepository.countMembersInWorkspace(workspace.id);
        if (currentMembersCount >= effectiveMaxMembers) {
            throw new AppError(ErrorMessage.WORKSPACE_FULL, HttpStatusCode.BAD_REQUEST);
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const targetUser = await this._userRepository.findByEmail(normalizedEmail);

        // Unregistered user: store pending email invite and send join/register link
        if (!targetUser || !targetUser.id) {
            const pendingEmails = workspace.pendingInviteEmails ?? [];
            if (!pendingEmails.includes(normalizedEmail)) {
                await this._workspaceRepository.update(workspace.id, {
                    pendingInviteEmails: [...pendingEmails, normalizedEmail]
                });
            }

            const inviteLink = `${clientUrl}/register?inviteCode=${workspace.inviteCode}&email=${encodeURIComponent(normalizedEmail)}`;

            try {
                await this._emailService.sendWorkspaceInviteEmail(
                    normalizedEmail,
                    workspace.name,
                    inviteLink
                );
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.error(`Invite email failed for unregistered address ${normalizedEmail}: ${errorMessage}`);
                throw new AppError(ErrorMessage.EMAIL_SEND_FAILED, HttpStatusCode.INTERNAL_SERVER);
            }

            return {
                success: true,
                message: SuccessMessage.WORKSPACE_INVITE_EMAIL_SENT
            };
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

        // Drop from pending list if they registered after an earlier email invite
        const pendingEmails = workspace.pendingInviteEmails ?? [];
        if (pendingEmails.includes(normalizedEmail)) {
            await this._workspaceRepository.update(workspace.id, {
                pendingInviteEmails: pendingEmails.filter((email) => email !== normalizedEmail)
            });
        }

        const inviteLink = `${clientUrl}/dashboard?inviteCode=${workspace.inviteCode}`;

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
                ? SuccessMessage.WORKSPACE_INVITE_SENT
                : SuccessMessage.WORKSPACE_INVITE_IN_APP_ONLY
        };
    }
}
