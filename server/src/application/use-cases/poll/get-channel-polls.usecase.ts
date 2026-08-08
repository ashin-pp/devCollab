import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { PollResponseDto } from "../../dtos/poll/response/poll.response.dto";
import { IGetChannelPollsUseCase } from "../../interfaces/use-cases/poll/get-channel-polls.usecase.interface";
import { toPollResponseDto } from "../../mappers/poll.mapper";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetChannelPollsUseCase implements IGetChannelPollsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(channelId: string): Promise<PollResponseDto[]> {
        const polls = await this._pollRepository.findByChannel(channelId);
        return polls.map(toPollResponseDto);
    }
}
