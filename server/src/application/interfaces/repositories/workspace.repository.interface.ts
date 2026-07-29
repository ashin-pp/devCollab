import { Workspace } from "../../../domain/entities/workspace.entity";

export interface IWorkspaceRepository {
    create(workspace: Workspace): Promise<Workspace>;
    findById(id: string): Promise<Workspace | null>;
    findByInviteCode(inviteCode: string): Promise<Workspace | null>;
    findByNameIgnoreCase(name: string): Promise<Workspace | null>;
    findAllByUserId(userId: string): Promise<Workspace[]>; // Workspaces created by or joined by user
    update(id: string, workspaceData: Partial<Workspace>): Promise<Workspace | null>;
    delete(id: string): Promise<boolean>;
    findAll(): Promise<Workspace[]>;
    findPublicWorkspaces(): Promise<Workspace[]>;
    findByIds(ids: string[]): Promise<Workspace[]>;
    findByPendingInviteEmail(email: string): Promise<Workspace[]>;
    findPaginated(query: Record<string, unknown>, page: number, limit: number, sort?: Record<string, 1 | -1>): Promise<{ data: Workspace[]; total: number }>;
}
