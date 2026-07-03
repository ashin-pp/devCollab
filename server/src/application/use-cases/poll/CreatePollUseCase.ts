import { IPollRepository } from "../../repositories/IPollRepository";
import { IWorkspaceMemberRepository } from "../../repositories/IWorkspaceMemberRepository";
import { IChannelMemberRepository } from "../../repositories/IChannelMemberRepository";
import { IChannelRepository } from "../../repositories/IChannelRepository";
import { IWorkspaceRepository } from "../../repositories/IWorkspaceRepository";
import { CreateNotificationUseCase } from "../notification/CreateNotificationUseCase";
import { Poll } from "../../../domain/entities/Poll";
import mongoose from "mongoose";

export class CreatePollUseCase {
    constructor(
        private readonly pollRepository: IPollRepository,
        private readonly workspaceMemberRepository?: IWorkspaceMemberRepository,
        private readonly channelMemberRepository?: IChannelMemberRepository,
        private readonly createNotificationUseCase?: CreateNotificationUseCase,
        private readonly channelRepository?: IChannelRepository,
        private readonly workspaceRepository?: IWorkspaceRepository
    ) {}

    async execute(data: {
        workspaceId: string;
        question: string;
        options: string[];
        createdBy: string;
        channelId?: string;
        expiresAt?: Date;
        startsAt?: Date;
    }): Promise<Poll> {
        if (!data.workspaceId || !data.question || !data.options || data.options.length < 2) {
            throw new Error("Invalid poll data");
        }

        if (data.expiresAt && new Date(data.expiresAt).getTime() <= Date.now()) {
            throw new Error("Expiry time must be in the future");
        }

        if (data.startsAt && data.expiresAt && new Date(data.startsAt).getTime() >= new Date(data.expiresAt).getTime()) {
            throw new Error("Expiry time must be after start time");
        }

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

        const savedPoll = await this.pollRepository.create(newPoll);

        // Send Notifications
        if (this.createNotificationUseCase) {
            let membersToNotify: string[] = [];
            let notificationMessage = '';

            if (data.channelId && this.channelMemberRepository) {
                // Channel Poll - notify channel members
                const channelMembers = await this.channelMemberRepository.findByChannelId(data.channelId);
                membersToNotify = channelMembers.map(m => m.userId).filter(id => id !== data.createdBy);
                
                let channelName = "a channel";
                if (this.channelRepository) {
                    const channel = await this.channelRepository.findById(data.channelId);
                    if (channel) {
                        channelName = channel.name;
                    }
                }
                
                let workspaceName = "a workspace";
                if (this.workspaceRepository) {
                    const workspace = await this.workspaceRepository.findById(data.workspaceId);
                    if (workspace) {
                        workspaceName = workspace.name;
                    }
                }
                
                notificationMessage = `A new poll has been created in ${channelName} channel inside ${workspaceName} workspace`;
            } else if (this.workspaceMemberRepository) {
                // Workspace Poll - notify workspace members
                const workspaceMembers = await this.workspaceMemberRepository.findAllByWorkspaceId(data.workspaceId);
                membersToNotify = workspaceMembers.map(m => m.userId).filter(id => id !== data.createdBy);
                
                let workspaceName = "a workspace";
                if (this.workspaceRepository) {
                    const workspace = await this.workspaceRepository.findById(data.workspaceId);
                    if (workspace) {
                        workspaceName = workspace.name;
                    }
                }
                
                notificationMessage = `A new poll has been created in the ${workspaceName} workspace polls`;
            }

            // Send notification to each member
            for (const userId of membersToNotify) {
                await this.createNotificationUseCase.execute({
                    userId,
                    type: 'POLL_CREATED',
                    title: 'New Poll Created',
                    message: notificationMessage,
                    relatedId: savedPoll.id
                }).catch(err => console.error("Failed to send poll notification", err));
            }
        }

        return savedPoll;
    }
}
