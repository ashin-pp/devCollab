import { IPollRepository } from "../../repositories/IPollRepository";
import { Poll } from "../../../domain/entities/Poll";
import mongoose from "mongoose";

export class CreatePollUseCase {
    constructor(private readonly pollRepository: IPollRepository) {}

    async execute(data: {
        workspaceId: string;
        question: string;
        options: string[];
        createdBy: string;
        channelId?: string;
        expiresAt?: Date;
    }): Promise<Poll> {
        if (!data.workspaceId || !data.question || !data.options || data.options.length < 2) {
            throw new Error("Invalid poll data");
        }

        if (data.expiresAt && new Date(data.expiresAt).getTime() <= Date.now()) {
            throw new Error("Expiry time must be in the future");
        }

        const pollOptions = data.options.map(opt => ({
            id: new mongoose.Types.ObjectId().toString(),
            text: opt,
            votes: []
        }));

        const newPoll = new Poll(
            data.workspaceId,
            data.question,
            pollOptions,
            data.createdBy,
            true,
            data.channelId,
            data.expiresAt
        );

        return await this.pollRepository.create(newPoll);
    }
}
