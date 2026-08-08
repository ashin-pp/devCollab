import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { ChannelMember } from "../../../domain/entities/channel-member.entity";
import { ChannelMemberRole, ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { SuccessMessage } from "../../../domain/enums/SuccessMessage";
import { AppError } from "../../../domain/errors/AppError";
import { JoinChannelRequestDto } from "../../dtos/channel/request/join-channel-request.dto";
import { IJoinChannelUseCase } from "../../interfaces/use-cases/channel/join-channel.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class JoinChannelUseCase implements IJoinChannelUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
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
                throw new AppError(ErrorMessage.CHANNEL_JOIN_BLOCKED, HttpStatusCode.FORBIDDEN);
            } else if (existingMember.status === ChannelMemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.ALREADY_CHANNEL_MEMBER, HttpStatusCode.BAD_REQUEST);
            } else if (existingMember.status === ChannelMemberStatus.PENDING) {
                if (isWorkspaceOwner) {
                    await this._channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.APPROVED);
                    return { success: true, status: ChannelMemberStatus.APPROVED, message: SuccessMessage.CHANNEL_JOINED };
                }
                throw new AppError(ErrorMessage.CHANNEL_JOIN_REQUEST_PENDING, HttpStatusCode.BAD_REQUEST);
            } else if (existingMember.status === ChannelMemberStatus.REJECTED) {
                if (isWorkspaceOwner) {
                    await this._channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.APPROVED);
                    return { success: true, status: ChannelMemberStatus.APPROVED, message: SuccessMessage.CHANNEL_JOINED };
                }
                await this._channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.PENDING);
                return { success: true, status: ChannelMemberStatus.PENDING, message: SuccessMessage.CHANNEL_JOIN_REQUESTED };
            }
        }

        let newStatus = channel.privacy === 'public' ? ChannelMemberStatus.APPROVED : ChannelMemberStatus.PENDING;

        // Workspace Owner bypass
        if (isWorkspaceOwner) {
            newStatus = ChannelMemberStatus.APPROVED;
        }

        const inactiveMember = await this._channelMemberRepository.findInactiveByChannelAndUser(channelId, userId);
        if (inactiveMember) {
            await this._channelMemberRepository.reactivate(channelId, userId, newStatus);
            const user = await this._userRepository.findById(userId);
            return {
                success: true,
                status: newStatus,
                message: newStatus === ChannelMemberStatus.APPROVED ? SuccessMessage.CHANNEL_JOINED : SuccessMessage.CHANNEL_JOIN_REQUESTED,
                userName: user?.name || 'A user'
            };
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
            message: newStatus === ChannelMemberStatus.APPROVED ? SuccessMessage.CHANNEL_JOINED : SuccessMessage.CHANNEL_JOIN_REQUESTED,
            userName: user?.name || 'A user'
        };
    }
}
