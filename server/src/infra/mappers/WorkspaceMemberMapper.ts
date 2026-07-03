import { WorkspaceMember } from "../../domain/entities/WorkspaceMember";
import { IMapper } from "../../application/interfaces/IMapper";
import { IWorkspaceMemberModel } from "../database/models/WorkspaceMemberModel";
import { MemberRole } from "../../domain/enums/MemberRole";
import { MemberStatus } from "../../domain/enums/MemberStatus";
import mongoose from "mongoose";

export class WorkspaceMemberMapper implements IMapper<WorkspaceMember, IWorkspaceMemberModel> {

    toDomain(persistence: IWorkspaceMemberModel): WorkspaceMember {
        return new WorkspaceMember(
            persistence.workspace_id.toString(),
            persistence.user_id.toString(),
            (persistence.role as MemberRole) ?? MemberRole.MEMBER,
            (persistence.status as MemberStatus) ?? MemberStatus.APPROVED,
            persistence.joined_at,
            persistence._id ? persistence._id.toString() : undefined
        );
    }

    toPersistence(domain: Partial<WorkspaceMember>): Partial<IWorkspaceMemberModel> {
        const persistence: Partial<IWorkspaceMemberModel> = {
            role: domain.role,
            status: domain.status,
        };

        if (domain.workspaceId) {
            persistence.workspace_id = new mongoose.Types.ObjectId(domain.workspaceId);
        }
        if (domain.userId) {
            persistence.user_id = new mongoose.Types.ObjectId(domain.userId);
        }

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IWorkspaceMemberModel>;
    }
}
