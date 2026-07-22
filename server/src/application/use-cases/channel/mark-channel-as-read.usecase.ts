import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { IMarkChannelAsReadUseCase } from "../../interfaces/use-cases/channel/mark-channel-as-read.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class MarkChannelAsReadUseCase implements IMarkChannelAsReadUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(payload: {channelId: string, userId: string}): Promise<{success: boolean, message: string, statusCode: number}> {
        const { channelId, userId } = payload;
        const membership = await this._channelMemberRepository.findByChannelIdAndUserId(channelId, userId);
        
        if (!membership) {
            return {
                success: false,
                message: 'Not a member of this channel',
                statusCode: HttpStatusCode.FORBIDDEN
            };
        }

        await this._channelMemberRepository.updateLastReadAt(channelId, userId, new Date());

        return {
            success: true,
            message: 'Channel marked as read',
            statusCode: HttpStatusCode.OK
        };
    }
}
