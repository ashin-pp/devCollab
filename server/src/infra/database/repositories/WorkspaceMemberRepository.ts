import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { WorkspaceMember } from "../../../domain/entities/WorkspaceMember";
import { WorkspaceMemberModel } from "../models/WorkspaceMemberModel";
import { WorkspaceMemberMapper } from "../../mappers/WorkspaceMemberMapper";

export class WorkspaceMemberRepository implements IWorkspaceMemberRepository {
    private _mapper = new WorkspaceMemberMapper();
    async create(member: WorkspaceMember): Promise<WorkspaceMember> {
        const createdMember = await WorkspaceMemberModel.create({
            workspace_id: member.workspaceId,
            user_id: member.userId,
            role: member.role,
            status: member.status
        });

        return this._mapper.toDomain(createdMember);
    }

    async findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
        const member = await WorkspaceMemberModel.findOne({
            workspace_id: workspaceId,
            user_id: userId
        });
        
        if (!member) {
            return null;
        }
        return this._mapper.toDomain(member);
    }

    async findAllByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
        const members = await WorkspaceMemberModel.find({ workspace_id: workspaceId });
        return members.map(m => this._mapper.toDomain(m));
    }

    async findAllByUserId(userId: string): Promise<WorkspaceMember[]> {
        const memberships = await WorkspaceMemberModel.find({ 
            user_id: userId, 
            $or: [{ status: 'approved' }, { status: 'blocked' }, { status: { $exists: false } }] 
        });
        return memberships.map(m => this._mapper.toDomain(m));
    }

    async remove(workspaceId: string, userId: string): Promise<boolean> {
        const result = await WorkspaceMemberModel.findOneAndDelete({
            workspace_id: workspaceId,
            user_id: userId
        });
        return result !== null;
    }

    async removeAllFromWorkspace(workspaceId: string): Promise<boolean> {
        const result = await WorkspaceMemberModel.deleteMany({ workspace_id: workspaceId });
        return result.acknowledged;
    }

    async countMembersInWorkspace(workspaceId: string): Promise<number> {
        return await WorkspaceMemberModel.countDocuments({ workspace_id: workspaceId });
    }

    async updateStatus(workspaceId: string, userId: string, status: 'pending' | 'approved' | 'blocked'): Promise<WorkspaceMember | null> {
        const updatedMember = await WorkspaceMemberModel.findOneAndUpdate(
            { workspace_id: workspaceId, user_id: userId },
            { status },
            { new: true }
        );
        if (!updatedMember) {
            return null;
        }
        return this._mapper.toDomain(updatedMember);
    }
}
