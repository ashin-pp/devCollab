import { inject, injectable } from 'tsyringe';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { logger } from "../../../infrastructure/di/container";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { IClaimPendingWorkspaceInvitesUseCase } from "../../interfaces/use-cases/workspace/claim-pending-workspace-invites.usecase.interface";

@injectable()
export class ClaimPendingWorkspaceInvitesUseCase implements IClaimPendingWorkspaceInvitesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase
    ) {}

    async execute(payload: { userId: string; email: string }): Promise<void> {
        const normalizedEmail = payload.email?.toLowerCase().trim();
        if (!payload.userId || !normalizedEmail) return;

        const workspaces = await this._workspaceRepository.findByPendingInviteEmail(normalizedEmail);
        if (workspaces.length === 0) return;

        for (const workspace of workspaces) {
            if (!workspace.id) continue;

            const existingMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(
                workspace.id,
                payload.userId
            );

            if (existingMember) {
                if (existingMember.status === MemberStatus.BLOCKED) {
                    continue;
                }
                if (existingMember.status === MemberStatus.PENDING) {
                    await this._workspaceMemberRepository.updateStatus(
                        workspace.id,
                        payload.userId,
                        MemberStatus.INVITED
                    );
                }
            } else {
                await this._workspaceMemberRepository.create(
                    new WorkspaceMember(
                        workspace.id,
                        payload.userId,
                        MemberRole.MEMBER,
                        MemberStatus.INVITED,
                        new Date()
                    )
                );

                await this._createNotificationUseCase.execute({
                    userId: payload.userId,
                    type: 'WORKSPACE_INVITE',
                    title: 'Workspace Invitation',
                    message: `You have been invited to join the workspace "${workspace.name}".`,
                    relatedId: workspace.id
                }).catch((err: unknown) =>
                    logger.error(
                        `Failed to create claimed invite notification: ${err instanceof Error ? err.message : String(err)}`
                    )
                );
            }

            const pendingEmails = workspace.pendingInviteEmails ?? [];
            if (pendingEmails.includes(normalizedEmail)) {
                await this._workspaceRepository.update(workspace.id, {
                    pendingInviteEmails: pendingEmails.filter((email) => email !== normalizedEmail)
                });
            }
        }
    }
}
