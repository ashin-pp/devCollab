import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { AppError } from "../../../domain/errors/AppError";
import { IBlockChannelMemberUseCase } from "../../interfaces/use-cases/channel/block-channel-member.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class BlockChannelMemberUseCase implements IBlockChannelMemberUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, channelId: string, memberId: string, requesterId: string}): Promise<{ userId: string, userName: string, removedBy: string }> {
        const { workspaceId, channelId, memberId, requesterId } = payload;
        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.privacy !== 'public') {
            throw new AppError("Blocking members is only supported in public channels.", HttpStatusCode.BAD_REQUEST);
        }

        const isCreator = channel.createdBy === requesterId;
        let isWorkspaceOwner = false;
        
        if (!isCreator) {
            const workspaceMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requesterId);
            isWorkspaceOwner = workspaceMember?.role === MemberRole.OWNER;
        }

        if (!isCreator && !isWorkspaceOwner) {
            throw new AppError("Only the channel creator or workspace owner can block members.", HttpStatusCode.FORBIDDEN);
        }

        if (memberId === requesterId) {
            throw new AppError("You cannot block yourself from the channel.", HttpStatusCode.BAD_REQUEST);
        }

        const targetMember = await this._channelMemberRepository.findByChannelAndUser(channelId, memberId);
        
        if (targetMember) {
            await this._channelMemberRepository.updateStatus(channelId, memberId, ChannelMemberStatus.BLOCKED);
            
            const [targetUser, requestUser] = await Promise.all([
                this._userRepository.findById(memberId),
                this._userRepository.findById(requesterId)
            ]);

            return {
                userId: memberId,
                userName: targetUser?.name || 'Unknown User',
                removedBy: requestUser?.name || 'Admin'
            };
        } else {
            throw new AppError("User is not a member of this channel.", HttpStatusCode.NOT_FOUND);
        }
    }
}
