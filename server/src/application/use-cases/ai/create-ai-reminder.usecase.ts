import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import * as schedule from "node-schedule";
import { inject, injectable } from 'tsyringe';
import type { IAIReminderRepository } from "../../../application/interfaces/repositories/ai-reminder.repository.interface";
import { AIReminder } from "../../../domain/entities/ai-reminder.entity";
import { NotificationTitle } from "../../../domain/enums/NotificationMessage";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ICreateAIReminderUseCase } from "../../interfaces/use-cases/ai/create-ai-reminder.usecase.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { normalizeAiDateTime } from "../../../infrastructure/ai/utils/datetime.utils";

const SYSTEM_AGENT_ID = "000000000000000000000000";

@injectable()
export class CreateAIReminderUseCase implements ICreateAIReminderUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAIReminderRepository) private _aiReminderRepository: IAIReminderRepository,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository
    ) {}

    private async buildReminderMessage(
        content: string,
        channelId: string,
        senderId?: string
    ): Promise<string> {
        if (!senderId || senderId === SYSTEM_AGENT_ID) {
            return content;
        }
        const sender = await this._userRepository.findById(senderId);
        const channel = await this._channelRepository.findById(channelId);
        if (sender && channel) {
            return `@${sender.name} in #${channel.name} reminded you: "${content}"`;
        }
        if (sender) {
            return `@${sender.name} reminded you: "${content}"`;
        }
        return content;
    }

    async execute(data: {
        userId: string;
        workspaceId: string;
        channelId: string;
        content: string;
        remindAt: string;
        senderId?: string;
    }): Promise<void> {
        const remindAt = normalizeAiDateTime(data.remindAt);

        const newReminder: Partial<AIReminder> = {
            userId: data.userId,
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            content: data.content,
            remindAt,
            isSent: false,
            senderId: data.senderId,
        };

        const saved = await this._aiReminderRepository.create(newReminder);

        const fire = async () => {
            try {
                const finalMessage = await this.buildReminderMessage(
                    data.content,
                    data.channelId,
                    data.senderId
                );

                await this._createNotificationUseCase.execute({
                    userId: data.userId,
                    type: "GENERAL",
                    title: NotificationTitle.AI_REMINDER,
                    message: finalMessage,
                    relatedId: data.workspaceId,
                    actorId: data.senderId,
                });

                if (saved.id) {
                    await this._aiReminderRepository.markAsSent(saved.id);
                }
            } catch (error) {
                console.error("Failed to send scheduled AI reminder notification", error);
            }
        };

        if (remindAt > new Date()) {
            schedule.scheduleJob(remindAt, fire);
        } else {
            await fire();
        }
    }
}
