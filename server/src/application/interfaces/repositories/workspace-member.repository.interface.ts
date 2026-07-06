import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";

export interface IWorkspaceMemberRepository {
    create(member: WorkspaceMember): Promise<WorkspaceMember>;
    findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
    findAllByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]>;
    findAllByUserId(userId: string): Promise<WorkspaceMember[]>;
    remove(workspaceId: string, userId: string): Promise<boolean>;
    removeAllFromWorkspace(workspaceId: string): Promise<boolean>;
    countMembersInWorkspace(workspaceId: string): Promise<number>;
    updateStatus(workspaceId: string, userId: string, status: 'pending' | 'approved' | 'blocked' | 'invited'): Promise<WorkspaceMember | null>;
    findPaginated(query: Record<string, unknown>, page: number, limit: number, sort?: Record<string, 1 | -1>): Promise<{ data: WorkspaceMember[]; total: number }>;
}
