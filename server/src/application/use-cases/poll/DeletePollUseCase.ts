import { IPollRepository } from "../../repositories/IPollRepository";
import { Poll } from "../../../domain/entities/Poll";

export class DeletePollUseCase {
    constructor(private readonly pollRepository: IPollRepository) {}

    async execute(pollId: string, userId: string): Promise<Poll> {
        const poll = await this.pollRepository.findById(pollId);
        
        if (!poll) {
            throw new Error("Poll not found");
        }

        if (poll.createdBy !== userId) {
            throw new Error("Only the creator can delete this poll");
        }

        await this.pollRepository.delete(pollId);
        return poll;
    }
}
