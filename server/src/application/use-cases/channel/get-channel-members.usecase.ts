import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { ChannelMemberRole, ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ChannelMemberResponseDto } from "../../dtos/channel/response/channel-member.response.dto";
import { IGetChannelMembersUseCase } from "../../interfaces/use-cases/channel/get-channel-members.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetChannelMembersUseCase implements IGetChannelMembersUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {workspaceId: string, channelId: string, requestUserId: string}): Promise<ChannelMemberResponseDto[]> {
        const { workspaceId, channelId, requestUserId } = payload;
        if (!workspaceId || !channelId) {
            throw new AppError(ErrorMessage.INVALID_CHANNEL_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const memberCheck = await this._channelMemberRepository.findByChannelAndUser(channelId, requestUserId);
        if (!memberCheck) {
            throw new AppError(ErrorMessage.CANNOT_VIEW_CHANNEL_MEMBERS, HttpStatusCode.FORBIDDEN);
        }

        const members = await this._channelMemberRepository.findByChannelId(channelId);

        const membersWithDetails = await Promise.all(
            members.map(async (member) => {
                const user = await this._userRepository.findById(member.userId);
                return {
                    id: member.id as string,
                    channelId: member.channelId,
                    userId: member.userId,
                    role: member.role as unknown as ChannelMemberRole,
                    status: member.status as unknown as ChannelMemberStatus,
                    joinedAt: member.joinedAt as Date,
                    user: user ? {
                        id: user.id as string,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage,
                        skills: user.skills || []
                    } : undefined
                };
            })
        );

        return membersWithDetails;
    }
}
