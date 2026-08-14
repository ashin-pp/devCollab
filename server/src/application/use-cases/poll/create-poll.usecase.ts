import mongoose from "mongoose";
import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";
import { NotificationTitle } from "../../../domain/enums/NotificationMessage";
import { PollResponseDto } from "../../dtos/poll/response/poll.response.dto";
import { ICreatePollUseCase } from "../../interfaces/use-cases/poll/create-poll.usecase.interface";
import { toPollResponseDto } from "../../mappers/poll.mapper";
import { CreateNotificationUseCase } from "../notification/create-notification.usecase";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class CreatePollUseCase implements ICreatePollUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository,
        private readonly _workspaceMemberRepository?: IWorkspaceMemberRepository,
        private readonly _channelMemberRepository?: IChannelMemberRepository,
        @inject(CreateNotificationUseCase) private readonly _createNotificationUseCase?: CreateNotificationUseCase,
        private readonly _channelRepository?: IChannelRepository,
        private readonly _workspaceRepository?: IWorkspaceRepository
    ) {}

    async execute(data: {
        workspaceId: string;
        question: string;
        options: string[];
        createdBy: string;
        channelId?: string;
        expiresAt?: Date;
        startsAt?: Date;
    }): Promise<PollResponseDto> {
        const pollOptions = data.options.map(opt => ({
            id: new mongoose.Types.ObjectId().toString(),
            text: opt,
            votes: []
        }));

        const newPoll = new Poll(
            data.workspaceId,
            data.question,
            pollOptions,
            data.createdBy,
            true,
            data.channelId,
            data.expiresAt,
            data.startsAt
        );

        const savedPoll = await this._pollRepository.create(newPoll);

        if (this._createNotificationUseCase) {
            let membersToNotify: string[] = [];
            let notificationMessage = '';

            if (data.channelId && this._channelMemberRepository) {
                const channelMembers = await this._channelMemberRepository.findByChannelId(data.channelId);
                membersToNotify = channelMembers.map((m: any) => m.userId).filter((id: any) => id !== data.createdBy);
                
                let channelName = "a channel";
                if (this._channelRepository) {
                    const channel = await this._channelRepository.findById(data.channelId);
                    if (channel) {
                        channelName = channel.name;
                    }
                }
                
                let workspaceName = "a workspace";
                if (this._workspaceRepository) {
                    const workspace = await this._workspaceRepository.findById(data.workspaceId);
                    if (workspace) {
                        workspaceName = workspace.name;
                    }
                }
                
                notificationMessage = `A new poll has been created in ${channelName} channel inside ${workspaceName} workspace`;
            } else if (this._workspaceMemberRepository) {
                const workspaceMembers = await this._workspaceMemberRepository.findAllByWorkspaceId(data.workspaceId);
                membersToNotify = workspaceMembers.map((m: any) => m.userId).filter((id: any) => id !== data.createdBy);
                
                let workspaceName = "a workspace";
                if (this._workspaceRepository) {
                    const workspace = await this._workspaceRepository.findById(data.workspaceId);
                    if (workspace) {
                        workspaceName = workspace.name;
                    }
                }
                
                notificationMessage = `A new poll has been created in the ${workspaceName} workspace polls`;
            }

            for (const userId of membersToNotify) {
                await this._createNotificationUseCase.execute({
                    userId,
                    type: 'POLL_CREATED',
                    title: NotificationTitle.NEW_POLL_CREATED,
                    message: notificationMessage,
                    relatedId: savedPoll.id
                }).catch(err => console.error("Failed to send poll notification", err));
            }
        }

        return toPollResponseDto(savedPoll);
    }
}
