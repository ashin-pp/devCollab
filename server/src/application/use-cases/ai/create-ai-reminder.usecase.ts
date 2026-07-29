import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import * as schedule from "node-schedule";
import { inject, injectable } from 'tsyringe';
import type { IAIReminderRepository } from "../../../application/interfaces/repositories/ai-reminder.repository.interface";
import { AIReminder } from "../../../domain/entities/ai-reminder.entity";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ICreateAIReminderUseCase } from "../../interfaces/use-cases/ai/create-ai-reminder.usecase.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class CreateAIReminderUseCase implements ICreateAIReminderUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAIReminderRepository) private _aiReminderRepository: IAIReminderRepository,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository
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
