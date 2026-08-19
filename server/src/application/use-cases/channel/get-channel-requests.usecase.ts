import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ChannelMemberRole, ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ChannelMemberResponseDto } from "../../dtos/channel/response/channel-member.response.dto";
import { IGetChannelRequestsUseCase } from "../../interfaces/use-cases/channel/get-channel-requests.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetChannelRequestsUseCase implements IGetChannelRequestsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {channelId: string}): Promise<ChannelMemberResponseDto[]> {
        const { channelId } = payload;
        const pendingMembers = await this._channelMemberRepository.findByChannelId(channelId, 'pending');
        
        const requestsWithUsers = await Promise.all(pendingMembers.map(async (member) => {
            const user = await this._userRepository.findById(member.userId);
            return {
                id: member.id as string,
                channelId: member.channelId,
                userId: member.userId,
                role: member.role as unknown as ChannelMemberRole,
                status: member.status as unknown as ChannelMemberStatus,
                joinedAt: member.joinedAt as Date,
                profile: user ? {
                    id: user.id as string,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    skills: user.skills || []
                } : undefined
            };
        }));

        return requestsWithUsers;
    }
}
