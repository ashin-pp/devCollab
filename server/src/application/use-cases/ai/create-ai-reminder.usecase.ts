import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IAIReminderRepository } from "../../../application/interfaces/repositories/ai-reminder.repository.interface";
import { AIReminder } from "../../../domain/entities/ai-reminder.entity";
import { ICreateReminderDependency } from "../../../infrastructure/ai/tools/RemindTool";
import { CreateNotificationUseCase } from "../notification/create-notification.usecase";
import * as schedule from "node-schedule";

import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";

@injectable()
export class CreateAIReminderUseCase implements ICreateReminderDependency {
    constructor(
        @inject(TOKENS.IAIReminderRepository) private _aiReminderRepository: IAIReminderRepository,
        @inject(CreateNotificationUseCase) private _createNotificationUseCase: CreateNotificationUseCase,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository
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

        await this._aiReminderRepository.create(newReminder);
        const scheduledTime = new Date(data.remindAt);
        if (scheduledTime > new Date()) {
            schedule.scheduleJob(scheduledTime, async () => {
                try {
                    let finalMessage = data.content;
                    
                    if (data.senderId) {
                        const sender = await this._userRepository.findById(data.senderId);
                        const channel = await this._channelRepository.findById(data.channelId);
                        if (sender && channel) {
                            finalMessage = `@${sender.name} in #${channel.name} reminded you: "${data.content}"`;
                        }
                    }

                    await this._createNotificationUseCase.execute({
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
                    const sender = await this._userRepository.findById(data.senderId);
                    const channel = await this._channelRepository.findById(data.channelId);
                    if (sender && channel) {
                        finalMessage = `@${sender.name} in #${channel.name} reminded you: "${data.content}"`;
                    }
                }

                await this._createNotificationUseCase.execute({
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
