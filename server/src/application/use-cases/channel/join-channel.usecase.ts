import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ChannelMember } from "../../../domain/entities/channel-member.entity";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberStatus, ChannelMemberRole } from "../../../domain/enums/ChannelMemberStatus";
import { MemberRole } from "../../../domain/enums/MemberRole";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { JoinChannelRequestDto } from "../../dtos/channel/request/join-channel-request.dto";

@injectable()
export class JoinChannelUseCase implements IBaseUseCase<JoinChannelRequestDto, { success: boolean; status: string; message: string; userName?: string }> {
    constructor(
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(payload: JoinChannelRequestDto): Promise<{ success: boolean; status: string; message: string; userName?: string }> {
        const { workspaceId, channelId, userId } = payload;
        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        let isWorkspaceOwner = false;
        if (channel.privacy === 'private') {
            const workspaceMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
            isWorkspaceOwner = workspaceMember?.role === MemberRole.OWNER;
        }

        const existingMember = await this._channelMemberRepository.findByChannelAndUser(channelId, userId);
        if (existingMember) {
            if (existingMember.status === ChannelMemberStatus.BLOCKED) {
                throw new AppError("You have been blocked from joining this channel.", HttpStatusCode.FORBIDDEN);
            } else if (existingMember.status === ChannelMemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.ALREADY_CHANNEL_MEMBER, HttpStatusCode.BAD_REQUEST);
            } else if (existingMember.status === ChannelMemberStatus.PENDING) {
                if (isWorkspaceOwner) {
                    await this._channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.APPROVED);
                    return { success: true, status: ChannelMemberStatus.APPROVED, message: 'Successfully joined the channel' };
                }
                throw new AppError(ErrorMessage.CHANNEL_JOIN_REQUEST_PENDING, HttpStatusCode.BAD_REQUEST);
            } else if (existingMember.status === ChannelMemberStatus.REJECTED) {
                if (isWorkspaceOwner) {
                    await this._channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.APPROVED);
                    return { success: true, status: ChannelMemberStatus.APPROVED, message: 'Successfully joined the channel' };
                }
                await this._channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.PENDING);
                return { success: true, status: ChannelMemberStatus.PENDING, message: 'Join request submitted' };
            }
        }

        let newStatus = channel.privacy === 'public' ? ChannelMemberStatus.APPROVED : ChannelMemberStatus.PENDING;

        // Workspace Owner bypass
        if (isWorkspaceOwner) {
            newStatus = ChannelMemberStatus.APPROVED;
        }
        const member = new ChannelMember(
            channelId,
            userId,
            userId,
            ChannelMemberRole.MEMBER,
            true,
            newStatus
        );

        await this._channelMemberRepository.create(member);

        const user = await this._userRepository.findById(userId);

        return {
            success: true,
            status: newStatus,
            message: newStatus === ChannelMemberStatus.APPROVED ? 'Successfully joined the channel' : 'Join request submitted',
            userName: user?.name || 'A user'
        };
    }
}
