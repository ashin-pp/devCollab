import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { AppError } from "../../../domain/errors/AppError";
import { IUnblockChannelMemberUseCase } from "../../interfaces/use-cases/channel/unblock-channel-member.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class UnblockChannelMemberUseCase implements IUnblockChannelMemberUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, channelId: string, memberId: string, requesterId: string}): Promise<void> {
        const { workspaceId, channelId, memberId, requesterId } = payload;
        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.privacy !== 'public') {
            throw new AppError("Blocking/Unblocking members is only supported in public channels.", HttpStatusCode.BAD_REQUEST);
        }

        const isCreator = channel.createdBy === requesterId;
        let isWorkspaceOwner = false;
        
        if (!isCreator) {
            const workspaceMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requesterId);
            isWorkspaceOwner = workspaceMember?.role === MemberRole.OWNER;
        }

        if (!isCreator && !isWorkspaceOwner) {
            throw new AppError("Only the channel creator or workspace owner can unblock members.", HttpStatusCode.FORBIDDEN);
        }

        const targetMember = await this._channelMemberRepository.findByChannelAndUser(channelId, memberId);
        
        if (targetMember) {
            // Restore the user to approved status so they reappear in the members list
            await this._channelMemberRepository.updateStatus(channelId, memberId, ChannelMemberStatus.APPROVED);
        } else {
            throw new AppError("User is not a member of this channel.", HttpStatusCode.NOT_FOUND);
        }
    }
}
