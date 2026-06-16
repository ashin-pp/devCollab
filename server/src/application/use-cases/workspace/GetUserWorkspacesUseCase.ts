import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { Workspace } from "../../../domain/entities/Workspace";
import { WorkspaceMember } from "../../../domain/entities/WorkspaceMember";

export class GetUserWorkspacesUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(userId: string): Promise<(Workspace & { memberStatus: string })[]> {
        const memberships: WorkspaceMember[] = await this.workspaceMemberRepository.findAllByUserId(userId);
        const workspaceIds = memberships.map((m: WorkspaceMember) => m.workspaceId);
        
        if (workspaceIds.length === 0) return [];
        
        const workspaces = await this.workspaceRepository.findByIds(workspaceIds);
        
        return workspaces.map(ws => {
            const member = memberships.find((m: WorkspaceMember) => m.workspaceId === ws.id);
            return {
                ...ws,
                memberStatus: member?.status || 'approved'
            } as Workspace & { memberStatus: string };
        });
    }
}
