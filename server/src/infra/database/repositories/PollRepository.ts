import { Poll } from "../../../domain/entities/Poll";
import { IPollRepository } from "../../../application/repositories/IPollRepository";
import { IPollDocument, PollModel } from "../models/PollModel";
import { MongoBaseRepository } from "./BaseRepository";
import { PollMapper } from "../../mappers/PollMapper";
import mongoose from "mongoose";

export class PollRepository extends MongoBaseRepository<Poll, IPollDocument> implements IPollRepository {
    constructor() {
        super(PollModel, new PollMapper());
    }

    async findByWorkspace(workspaceId: string): Promise<Poll[]> {
        const polls = await this.model.find({ 
            workspace_id: new mongoose.Types.ObjectId(workspaceId),
            channel_id: { $exists: false }
        }).sort({ created_at: -1 });
        return polls.map(p => this._mapper.toDomain(p));
    }

    async findByChannel(channelId: string): Promise<Poll[]> {
        const polls = await this.model.find({ 
            channel_id: new mongoose.Types.ObjectId(channelId) 
        }).sort({ created_at: -1 });
        return polls.map(p => this._mapper.toDomain(p));
    }

    async findActiveByWorkspace(workspaceId: string): Promise<Poll[]> {
        const polls = await this.model.find({ 
            workspace_id: new mongoose.Types.ObjectId(workspaceId),
            is_active: true,
            channel_id: { $exists: false }
        }).sort({ created_at: -1 });
        return polls.map(p => this._mapper.toDomain(p));
    }
}
