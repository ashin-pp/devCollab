import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../../domain/enums/SuccessMessage";
import { IMarkChannelAsReadUseCase } from "../../interfaces/use-cases/channel/mark-channel-as-read.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class MarkChannelAsReadUseCase implements IMarkChannelAsReadUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(payload: {channelId: string, userId: string, readUpto?: Date}): Promise<{success: boolean, message: string, statusCode: number}> {
        const { channelId, userId, readUpto } = payload;
        const membership = await this._channelMemberRepository.findByChannelIdAndUserId(channelId, userId);
        
        if (!membership) {
            return {
                success: false,
                message: ErrorMessage.NOT_CHANNEL_MEMBER,
                statusCode: HttpStatusCode.FORBIDDEN
            };
        }

        await this._channelMemberRepository.updateLastReadAt(channelId, userId, readUpto ?? new Date());

        return {
            success: true,
            message: SuccessMessage.CHANNEL_MARKED_READ,
            statusCode: HttpStatusCode.OK
        };
    }
}
