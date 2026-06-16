import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class GetAllWorkspacesUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(): Promise<any[]> {
        const workspaces = await this.workspaceRepository.findAll();
        
        const workspacesWithDetails = await Promise.all(workspaces.map(async (workspace) => {
            const memberCount = await this.workspaceMemberRepository.countMembersInWorkspace(workspace.id!);
            const owner = await this.userRepository.findById(workspace.createdBy);
            
            return {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                privacy: workspace.privacy,
                isActive: workspace.isActive,
                maxMembers: workspace.maxMembers,
                createdAt: workspace.createdAt,
                memberCount,
                ownerName: owner?.name || 'Unknown',
                ownerEmail: owner?.email || 'Unknown'
            };
        }));

        return workspacesWithDetails;
    }
}
