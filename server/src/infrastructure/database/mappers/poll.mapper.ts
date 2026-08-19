import { Poll, PollOption } from "../../../domain/entities/poll.entity";
import { IMapper } from "../../../application/interfaces/IMapper";
import { IPollDocument } from "../models/poll.model";
import mongoose from "mongoose";

export class PollMapper implements IMapper<Poll, IPollDocument> {
    toDomain(persistence: IPollDocument): Poll {
        return new Poll(
            persistence.workspace_id.toString(),
            persistence.question,
            persistence.options.map((opt: any) => ({
                id: opt._id.toString(),
                text: opt.text,
                votes: opt.votes.map((v: any) => v.toString())
            })),
            persistence.created_by.toString(),
            persistence.is_active,
            persistence.channel_id?.toString(),
            persistence.expires_at,
            persistence.starts_at,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<Poll>): Partial<IPollDocument> {
        const persistence: Record<string, unknown> = {
            workspace_id: domain.workspaceId ? new mongoose.Types.ObjectId(domain.workspaceId) : undefined,
            channel_id: domain.channelId ? new mongoose.Types.ObjectId(domain.channelId) : undefined,
            question: domain.question,
            options: domain.options?.map((opt: any) => ({
                ...(opt.id && { _id: new mongoose.Types.ObjectId(opt.id) }),
                text: opt.text,
                votes: opt.votes.map((v: any) => new mongoose.Types.ObjectId(v))
            })),
            created_by: domain.createdBy ? new mongoose.Types.ObjectId(domain.createdBy) : undefined,
            is_active: domain.isActive,
            expires_at: domain.expiresAt,
            starts_at: domain.startsAt,
        };

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IPollDocument>;
    }
}
