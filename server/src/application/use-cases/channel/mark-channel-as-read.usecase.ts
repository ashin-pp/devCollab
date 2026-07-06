import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class MarkChannelAsReadUseCase implements IBaseUseCase<{channelId: string, userId: string}, {success: boolean, message: string, statusCode: number}> {
    constructor(
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
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
