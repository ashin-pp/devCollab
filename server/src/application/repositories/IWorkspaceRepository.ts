import { Workspace } from "../../domain/entities/Workspace";

export interface IWorkspaceRepository {
    create(workspace: Workspace): Promise<Workspace>;
    findById(id: string): Promise<Workspace | null>;
    findByInviteCode(inviteCode: string): Promise<Workspace | null>;
    findAllByUserId(userId: string): Promise<Workspace[]>; // Workspaces created by or joined by user
    update(id: string, workspaceData: Partial<Workspace>): Promise<Workspace | null>;
    delete(id: string): Promise<boolean>;
    findAll(): Promise<Workspace[]>;
    findPublicWorkspaces(): Promise<Workspace[]>;
    findByIds(ids: string[]): Promise<Workspace[]>;
}
