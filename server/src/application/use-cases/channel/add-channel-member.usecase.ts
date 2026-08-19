import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { ChannelMember } from "../../../domain/entities/channel-member.entity";
import { ChannelMemberRole, ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { AppError } from "../../../domain/errors/AppError";
import { AddChannelMemberRequestDto } from "../../dtos/channel/request/add-channel-member-request.dto";
import { ChannelMemberResponseDto } from "../../dtos/channel/response/channel-member.response.dto";
import { IAddChannelMemberUseCase } from "../../interfaces/use-cases/channel/add-channel-member.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class AddChannelMemberUseCase implements IAddChannelMemberUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(payload: AddChannelMemberRequestDto): Promise<ChannelMemberResponseDto[]> {
        const { workspaceId, channelId, userIds, requestUserId } = payload;

        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const requestMember = await this._channelMemberRepository.findByChannelAndUser(channelId, requestUserId);

        if (!requestMember && channel.createdBy !== requestUserId) {
            if (channel.privacy === 'private') {
                throw new AppError(ErrorMessage.CANNOT_ADD_TO_PRIVATE_CHANNEL, HttpStatusCode.FORBIDDEN);
            }
            const workspaceMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
            if (!workspaceMember || workspaceMember.status !== MemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.NOT_APPROVED_TO_JOIN_CHANNEL, HttpStatusCode.FORBIDDEN);
            }
        }

        const addedMembers = [];

        for (const targetUserId of userIds) {
            const workspaceMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
            if (!workspaceMember || workspaceMember.status !== MemberStatus.APPROVED) {
                continue;
            }

            const existingMember = await this._channelMemberRepository.findByChannelAndUser(channelId, targetUserId);
            if (existingMember) {
                continue;
            }

            const newMember = new ChannelMember(
                channelId,
                targetUserId,
                requestUserId,
                ChannelMemberRole.MEMBER,
                true,
                ChannelMemberStatus.APPROVED,
                new Date()
            );

            const added = await this._channelMemberRepository.create(newMember);
            const user = await this._userRepository.findById(targetUserId);

            addedMembers.push({
                id: added.id as string,
                channelId: added.channelId,
                userId: added.userId,
                role: added.role as unknown as ChannelMemberRole,
                status: added.status as unknown as ChannelMemberStatus,
                joinedAt: added.joinedAt as Date,
                profile: {
                    id: user?.id as string,
                    email: user?.email || '',
                    name: user?.name || 'A user'
                } as any
            });
        }

        return addedMembers;
    }
}
