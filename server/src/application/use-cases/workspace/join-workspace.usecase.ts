import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { NotificationTitle } from "../../../domain/enums/NotificationMessage";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";
import { AppError } from "../../../domain/errors/AppError";
import { logger } from "../../../infrastructure/di/container";
import { JoinWorkspaceRequestDto } from "../../dtos/workspace/request/join-workspace.dto";
import { WorkspaceMemberResponseDto } from "../../dtos/workspace/response/workspace-member.response.dto";
import { IJoinWorkspaceUseCase } from "../../interfaces/use-cases/workspace/join-workspace.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";

@injectable()
export class JoinWorkspaceUseCase implements IJoinWorkspaceUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) { }

    async execute(payload: JoinWorkspaceRequestDto): Promise<WorkspaceMemberResponseDto> {
        await this._planEntitlementService.resolveForUserId(payload.userId);

        const workspace = await this._workspaceRepository.findByInviteCode(payload.inviteCode);

        if (!workspace || !workspace.id) {
            throw new AppError(ErrorMessage.INVALID_INVITE_CODE, HttpStatusCode.NOT_FOUND);
        }

        if (!workspace.isActive) {
            throw new AppError(ErrorMessage.WORKSPACE_INACTIVE, HttpStatusCode.FORBIDDEN);
        }

        const ownerEntitlement = await this._planEntitlementService.resolveForUserId(workspace.createdBy);
        const effectiveMaxMembers = Math.min(
            workspace.maxMembers,
            ownerEntitlement.plan.maxMembersPerWorkspace
        );

        const currentMembersCount = await this._workspaceMemberRepository.countMembersInWorkspace(workspace.id);
        workspace.setCurrentMemberCount(currentMembersCount);
        workspace.maxMembers = effectiveMaxMembers;

        if (!workspace.canAddMember()) {
            throw new AppError(ErrorMessage.WORKSPACE_FULL, HttpStatusCode.BAD_REQUEST);
        }

        const existingMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, payload.userId);

        if (existingMember) {
            if (existingMember.status === MemberStatus.BLOCKED) {
                throw new AppError(ErrorMessage.MEMBER_BLOCKED, HttpStatusCode.FORBIDDEN);
            }
            if (existingMember.status === MemberStatus.INVITED) {
                const updatedMember = await this._workspaceMemberRepository.updateStatus(workspace.id, payload.userId, MemberStatus.APPROVED);
                const mem = updatedMember || existingMember;
                return {
                    id: mem.id as string,
                    workspaceId: mem.workspaceId,
                    userId: mem.userId,
                    role: mem.role,
                    status: MemberStatus.APPROVED,
                    joinedAt: mem.joinedAt as Date
                };
            }
            if (existingMember.status === MemberStatus.PENDING) {
                throw new AppError(ErrorMessage.WORKSPACE_JOIN_REQUEST_PENDING, HttpStatusCode.CONFLICT);
            }
            throw new AppError(ErrorMessage.ALREADY_WORKSPACE_MEMBER, HttpStatusCode.CONFLICT);
        }

        const user = await this._userRepository.findById(payload.userId);
        const userEmail = user?.email?.toLowerCase().trim();
        const pendingEmails = workspace.pendingInviteEmails ?? [];
        const hasPendingEmailInvite = !!userEmail && pendingEmails.includes(userEmail);

        const initialStatus =
            hasPendingEmailInvite
                ? (payload.isFromEmailLink ? MemberStatus.APPROVED : MemberStatus.INVITED)
                : workspace.privacy !== WorkspacePrivacy.PRIVATE
                    ? MemberStatus.APPROVED
                    : MemberStatus.PENDING;

        const newMember = new WorkspaceMember(
            workspace.id,
            payload.userId,
            MemberRole.MEMBER,
            initialStatus
        );

        const createdMember = await this._workspaceMemberRepository.create(newMember);

        if (hasPendingEmailInvite && userEmail) {
            await this._workspaceRepository.update(workspace.id, {
                pendingInviteEmails: pendingEmails.filter((email) => email !== userEmail)
            });
        }

        if (createdMember.status === MemberStatus.PENDING && workspace.createdBy) {
            const requesterName = user?.name || userEmail || 'A user';
            await this._createNotificationUseCase.execute({
                userId: workspace.createdBy,
                type: 'JOIN_REQUEST',
                title: NotificationTitle.NEW_JOIN_REQUEST,
                message: `${requesterName} requested to join your workspace "${workspace.name}".`,
                relatedId: workspace.id
            }).catch((err: unknown) =>
                logger.error(
                    `Failed to notify owner of join request: ${err instanceof Error ? err.message : String(err)}`
                )
            );
        }

        return {
            id: createdMember.id as string,
            workspaceId: createdMember.workspaceId,
            userId: createdMember.userId,
            role: createdMember.role,
            status: createdMember.status,
            joinedAt: createdMember.joinedAt as Date
        };
    }
}
