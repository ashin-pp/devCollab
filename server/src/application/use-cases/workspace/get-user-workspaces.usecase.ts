import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import type { IClaimPendingWorkspaceInvitesUseCase } from "../../interfaces/use-cases/workspace/claim-pending-workspace-invites.usecase.interface";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IGetUserWorkspacesUseCase } from "../../interfaces/use-cases/workspace/get-user-workspaces.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";

@injectable()
export class GetUserWorkspacesUseCase implements IGetUserWorkspacesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(USECASE_TOKENS.IClaimPendingWorkspaceInvitesUseCase) private _claimPendingWorkspaceInvitesUseCase: IClaimPendingWorkspaceInvitesUseCase,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: { userId: string }): Promise<(WorkspaceResponseDto & { memberStatus: string })[]> {
        const user = await this._userRepository.findById(payload.userId);
        if (user?.email) {
            await this._claimPendingWorkspaceInvitesUseCase.execute({
                userId: payload.userId,
                email: user.email
            });
        }

        const memberships: WorkspaceMember[] = await this._workspaceMemberRepository.findAllByUserId(payload.userId);
        const workspaceIds = memberships.map((m: WorkspaceMember) => m.workspaceId);
        
        if (workspaceIds.length === 0) return [];
        
        const workspaces = await this._workspaceRepository.findByIds(workspaceIds);
        const ownerMeta = new Map<string, { aiAssistantEnabled: boolean; ownerPlanName: string }>();

        const result: (WorkspaceResponseDto & { memberStatus: string })[] = [];
        for (const ws of workspaces) {
            const member = memberships.find((m: WorkspaceMember) => m.workspaceId === ws.id);
            let meta = ownerMeta.get(ws.createdBy);
            if (!meta) {
                try {
                    const ownerEntitlement = await this._planEntitlementService.resolveForUserId(ws.createdBy);
                    meta = {
                        aiAssistantEnabled:
                            !ownerEntitlement.isExpired && ownerEntitlement.plan.aiAssistantEnabled,
                        // Prefer assigned/billing plan name (what the owner subscribed to).
                        ownerPlanName:
                            ownerEntitlement.billingPlan?.name?.trim() ||
                            ownerEntitlement.plan.name?.trim() ||
                            'No plan',
                    };
                } catch {
                    meta = { aiAssistantEnabled: false, ownerPlanName: 'No plan' };
                }
                ownerMeta.set(ws.createdBy, meta);
                
            }

            result.push({
                id: ws.id as string,
                name: ws.name,
                description: ws.description,
                logo: ws.logo,
                inviteCode: ws.inviteCode,
                createdBy: ws.createdBy,
                privacy: ws.privacy,
                maxMembers: ws.maxMembers,
                isActive: ws.isActive,
                aiAssistantEnabled: meta.aiAssistantEnabled,
                ownerPlanName: meta.ownerPlanName,
                createdAt: ws.createdAt as Date,
                updatedAt: ws.updatedAt as Date,
                memberStatus: member?.status || 'approved'
            });
        }

        return result;
    }
}
