import { injectable } from 'tsyringe';
import { Poll } from "../../../domain/entities/poll.entity";
import { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { IPollDocument, PollModel } from "../models/poll.model";
import { MongoBaseRepository } from "./base.repository";
import { PollMapper } from "../mappers/poll.mapper";
import mongoose from "mongoose";

@injectable()
export class PollRepository extends MongoBaseRepository<Poll, IPollDocument> implements IPollRepository {
    constructor() {
        super(PollModel, new PollMapper());
    }

    async findByWorkspace(workspaceId: string): Promise<Poll[]> {
        const polls = await this._model.find({ 
            workspace_id: new mongoose.Types.ObjectId(workspaceId),
            channel_id: { $exists: false }
        }).sort({ created_at: -1 });
        return polls.map((p: any) => this._mapper.toDomain(p));
    }

    async findByChannel(channelId: string): Promise<Poll[]> {
        const polls = await this._model.find({ 
            channel_id: new mongoose.Types.ObjectId(channelId) 
        }).sort({ created_at: -1 });
        return polls.map((p: any) => this._mapper.toDomain(p));
    }

    async findActiveByWorkspace(workspaceId: string): Promise<Poll[]> {
        const polls = await this._model.find({ 
            workspace_id: new mongoose.Types.ObjectId(workspaceId),
            is_active: true,
            channel_id: { $exists: false }
        }).sort({ created_at: -1 });
        return polls.map((p: any) => this._mapper.toDomain(p));
    }
}
