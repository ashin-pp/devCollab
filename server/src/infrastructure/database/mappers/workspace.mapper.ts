import { Workspace } from "../../../domain/entities/workspace.entity";
import { IMapper } from "../../../application/interfaces/IMapper";
import { IWorkspaceModel } from "../models/workspace.model";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";
import mongoose from "mongoose";

export class WorkspaceMapper implements IMapper<Workspace, IWorkspaceModel> {

    toDomain(persistence: IWorkspaceModel): Workspace {
        return new Workspace(
            persistence.name,
            persistence.invite_code,
            persistence.created_by.toString(),
            persistence.description,
            persistence.logo,
            (persistence.privacy as WorkspacePrivacy) ?? WorkspacePrivacy.PRIVATE,
            persistence.max_members,
            persistence.is_active,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<Workspace>): Partial<IWorkspaceModel> {
        const persistence: Partial<IWorkspaceModel> = {
            name: domain.name,
            description: domain.description,
            logo: domain.logo,
            invite_code: domain.inviteCode,
            privacy: domain.privacy,
            max_members: domain.maxMembers,
            is_active: domain.isActive,
        };

        if (domain.createdBy) {
            persistence.created_by = new mongoose.Types.ObjectId(domain.createdBy);
        }

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IWorkspaceModel>;
    }
}
