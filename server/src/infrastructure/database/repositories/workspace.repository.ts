import { injectable } from 'tsyringe';
import { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { Workspace } from "../../../domain/entities/workspace.entity";
import { WorkspaceModel } from "../models/workspace.model";
import { WorkspaceMapper } from "../mappers/workspace.mapper";

@injectable()
export class WorkspaceRepository implements IWorkspaceRepository {
    private _mapper = new WorkspaceMapper();
    async create(workspace: Workspace): Promise<Workspace> {
        const createdWorkspace = await WorkspaceModel.create({
            name: workspace.name,
            description: workspace.description,
            logo: workspace.logo,
            invite_code: workspace.inviteCode,
            created_by: workspace.createdBy,
            privacy: workspace.privacy,
            max_members: workspace.maxMembers,
            is_active: workspace.isActive,
            pending_invite_emails: workspace.pendingInviteEmails ?? [],
        });

        return this._mapper.toDomain(createdWorkspace);
    }



    async findById(id: string): Promise<Workspace | null> {
        const workspace = await WorkspaceModel.findById(id);
        if (!workspace) {
            return null;
        }
        return this._mapper.toDomain(workspace);
    }

    async findByInviteCode(inviteCode: string): Promise<Workspace | null> {
        const workspace = await WorkspaceModel.findOne({ invite_code: inviteCode });
        if (!workspace) {
            return null;
        }
        return this._mapper.toDomain(workspace);
    }

    async findByNameIgnoreCase(name: string): Promise<Workspace | null> {
        const trimmed = name.trim();
        if (!trimmed) return null;

        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const workspace = await WorkspaceModel.findOne({
            name: { $regex: `^${escaped}$`, $options: 'i' },
        });
        return workspace ? this._mapper.toDomain(workspace) : null;
    }

    async findAllByUserId(userId: string): Promise<Workspace[]> {
        const workspaces = await WorkspaceModel.find({ created_by: userId });
        return workspaces.map(w => this._mapper.toDomain(w));
    }

    async update(id: string, workspaceData: Partial<Workspace>): Promise<Workspace | null> {
        const updateData: Record<string, unknown> = {};

        if (workspaceData.name) {
            updateData.name = workspaceData.name;
        }
        if (workspaceData.description !== undefined) {
            updateData.description = workspaceData.description;
        }
        if (workspaceData.logo !== undefined) {
            updateData.logo = workspaceData.logo;
        }
        if (workspaceData.inviteCode) {
            updateData.invite_code = workspaceData.inviteCode;
        }
        if (workspaceData.privacy) {
            updateData.privacy = workspaceData.privacy;
        }
        if (workspaceData.isActive !== undefined) {
            updateData.is_active = workspaceData.isActive;
        }
        if (workspaceData.maxMembers !== undefined) {
            updateData.max_members = workspaceData.maxMembers;
        }
        if (workspaceData.pendingInviteEmails !== undefined) {
            updateData.pending_invite_emails = workspaceData.pendingInviteEmails;
        }

        const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedWorkspace) {
            return null;
        }
        return this._mapper.toDomain(updatedWorkspace);
    }

    async delete(id: string): Promise<boolean> {
        const result = await WorkspaceModel.findByIdAndDelete(id);
        return result !== null;
    }

    async findAll(): Promise<Workspace[]> {
        const workspaces = await WorkspaceModel.find().sort({ createdAt: -1 });
        return workspaces.map(w => this._mapper.toDomain(w));
    }

    async findPublicWorkspaces(): Promise<Workspace[]> {
        const workspaces = await WorkspaceModel.find({ privacy: 'public', is_active: true });
        return workspaces.map(w => this._mapper.toDomain(w));
    }

    async findByIds(ids: string[]): Promise<Workspace[]> {
        const workspaces = await WorkspaceModel.find({ _id: { $in: ids } });
        return workspaces.map(w => this._mapper.toDomain(w));
    }

    async findByPendingInviteEmail(email: string): Promise<Workspace[]> {
        const normalized = email.toLowerCase().trim();
        if (!normalized) return [];
        const workspaces = await WorkspaceModel.find({ pending_invite_emails: normalized });
        return workspaces.map((w) => this._mapper.toDomain(w));
    }

    async setSession(_session: unknown): Promise<void> {
        // Implementation for setSession if needed
    }

    async findPaginated(query: Record<string, unknown>, page: number, limit: number, sort?: Record<string, 1 | -1>): Promise<{ data: Workspace[]; total: number }> {
        const skip = (page - 1) * limit;
        
        let dbQuery = WorkspaceModel.find(query).skip(skip).limit(limit);
        if (sort) {
            dbQuery = dbQuery.sort(sort);
        }
        
        const [docs, total] = await Promise.all([
            dbQuery.exec(),
            WorkspaceModel.countDocuments(query).exec()
        ]);
        
        return {
            data: docs.map(d => this._mapper.toDomain(d)),
            total
        };
    }
}
