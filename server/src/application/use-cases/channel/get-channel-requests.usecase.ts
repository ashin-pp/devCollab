import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { ChannelMemberResponseDto } from "../../dtos/channel/response/channel-member.response.dto";
import { ChannelMemberRole, ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

@injectable()
export class GetChannelRequestsUseCase implements IBaseUseCase<{channelId: string}, ChannelMemberResponseDto[]> {
    constructor(
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {channelId: string}): Promise<ChannelMemberResponseDto[]> {
        const { channelId } = payload;
        const pendingMembers = await this._channelMemberRepository.findByChannelId(channelId, 'pending');
        
        // Fetch user details for each request
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
