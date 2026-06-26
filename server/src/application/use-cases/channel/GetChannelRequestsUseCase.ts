import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";

export class GetChannelRequestsUseCase {
    constructor(
        private channelMemberRepository: IChannelMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(channelId: string) {
        const pendingMembers = await this.channelMemberRepository.findByChannelId(channelId, 'pending');
        
        // Fetch user details for each request
        const requestsWithUsers = await Promise.all(pendingMembers.map(async (member) => {
            const user = await this.userRepository.findById(member.userId);
            return {
                ...member,
                user: user ? { id: user.id, name: user.name, email: user.email, profileImage: user.profileImage } : null
            };
        }));

        return requestsWithUsers;
    }
}
