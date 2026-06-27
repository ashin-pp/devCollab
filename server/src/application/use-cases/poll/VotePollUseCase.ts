import { IPollRepository } from "../../repositories/IPollRepository";
import { Poll } from "../../../domain/entities/Poll";

export class VotePollUseCase {
    constructor(private readonly pollRepository: IPollRepository) {}

    async execute(pollId: string, userId: string, optionId: string): Promise<Poll> {
        const poll = await this.pollRepository.findById(pollId);
        
        if (!poll) {
            throw new Error("Poll not found");
        }

        if (!poll.isActive) {
            throw new Error("Poll is no longer active");
        }

        if (poll.isExpired()) {
            poll.deactivate();
            await this.pollRepository.update(pollId, { isActive: false });
            throw new Error("Poll has expired");
        }

        poll.addVote(userId, optionId, false);

        const updated = await this.pollRepository.update(pollId, { options: poll.options });
        if (!updated) {
             throw new Error("Failed to update poll");
        }
        return updated;
    }
}
