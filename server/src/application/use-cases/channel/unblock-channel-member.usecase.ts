import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class UnblockChannelMemberUseCase implements IBaseUseCase<{workspaceId: string, channelId: string, memberId: string, requesterId: string}, void> {
    constructor(
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
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
