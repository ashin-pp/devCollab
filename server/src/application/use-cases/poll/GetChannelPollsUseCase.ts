import { IPollRepository } from "../../repositories/IPollRepository";
import { Poll } from "../../../domain/entities/Poll";

export class GetChannelPollsUseCase {
    constructor(private readonly pollRepository: IPollRepository) {}

    async execute(channelId: string): Promise<Poll[]> {
        if (!channelId) {
            throw new Error("Channel ID is required");
        }
        
        return await this.pollRepository.findByChannel(channelId);
    }
}
