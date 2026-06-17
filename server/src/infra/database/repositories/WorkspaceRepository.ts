import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { Workspace } from "../../../domain/entities/Workspace";
import { WorkspaceModel } from "../models/WorkspaceModel";
import { WorkspaceMapper } from "../../mappers/WorkspaceMapper";

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

}
