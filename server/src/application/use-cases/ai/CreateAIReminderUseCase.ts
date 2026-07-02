import { IAIReminderRepository } from "../../repositories/IAIReminderRepository";
import { AIReminder } from "../../../domain/entities/AIReminder";
import { ICreateReminderDependency } from "../../../infra/ai/tools/RemindTool";
import { CreateNotificationUseCase } from "../notification/CreateNotificationUseCase";
import * as schedule from "node-schedule";

import { IUserRepository } from "../../repositories/IUserRepository";
import { IChannelRepository } from "../../repositories/IChannelRepository";

export class CreateAIReminderUseCase implements ICreateReminderDependency {
    constructor(
        private aiReminderRepository: IAIReminderRepository,
        private createNotificationUseCase: CreateNotificationUseCase,
        private userRepository: IUserRepository,
        private channelRepository: IChannelRepository
    ) {}

    async execute(data: { userId: string; workspaceId: string; channelId: string; content: string; remindAt: string; senderId?: string }): Promise<void> {
        const newReminder: Partial<AIReminder> = {
            userId: data.userId,
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            content: data.content,
            remindAt: new Date(data.remindAt),
            isSent: false
        };

        await this.aiReminderRepository.create(newReminder);
        const scheduledTime = new Date(data.remindAt);
        if (scheduledTime > new Date()) {
            schedule.scheduleJob(scheduledTime, async () => {
                try {
                    let finalMessage = data.content;
                    
                    if (data.senderId) {
                        const sender = await this.userRepository.findById(data.senderId);
                        const channel = await this.channelRepository.findById(data.channelId);
                        if (sender && channel) {
                            finalMessage = `@${sender.name} in #${channel.name} reminded you: "${data.content}"`;
                        }
                    }

                    await this.createNotificationUseCase.execute({
                        userId: data.userId,
                        type: 'GENERAL',
                        title: 'AI Reminder',
                        message: finalMessage
                    });
                } catch (error) {
                    console.error("Failed to send scheduled AI reminder notification", error);
                }
            });
        } else {
            try {
                let finalMessage = data.content;
                
                if (data.senderId) {
                    const sender = await this.userRepository.findById(data.senderId);
                    const channel = await this.channelRepository.findById(data.channelId);
                    if (sender && channel) {
                        finalMessage = `@${sender.name} in #${channel.name} reminded you: "${data.content}"`;
                    }
                }

                await this.createNotificationUseCase.execute({
                    userId: data.userId,
                    type: 'GENERAL',
                    title: 'AI Reminder',
                    message: finalMessage
                });
            } catch (error) {
                console.error("Failed to send immediate AI reminder notification", error);
            }
        }
    }
}
