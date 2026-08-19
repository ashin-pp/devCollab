import { inject, injectable } from 'tsyringe';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IGetPublicWorkspacesUseCase } from "../../interfaces/use-cases/workspace/get-public-workspaces.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class GetPublicWorkspacesUseCase implements IGetPublicWorkspacesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(): Promise<WorkspaceResponseDto[]> {
        const workspaces = await this._workspaceRepository.findPublicWorkspaces();
        const ownerMeta = new Map<string, string>();

        const result: WorkspaceResponseDto[] = [];
        for (const ws of workspaces) {
            let ownerPlanName = ownerMeta.get(ws.createdBy);
            if (!ownerPlanName) {
                try {
                    const ownerEntitlement = await this._planEntitlementService.resolveForUserId(ws.createdBy);
                    ownerPlanName =
                        ownerEntitlement.billingPlan?.name?.trim() ||
                        ownerEntitlement.plan.name?.trim() ||
                        'No plan';
                } catch {
                    ownerPlanName = 'No plan';
                }
                ownerMeta.set(ws.createdBy, ownerPlanName);
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
                ownerPlanName,
                createdAt: ws.createdAt as Date,
                updatedAt: ws.updatedAt as Date,
            });
        }

        return result;
    }
}
