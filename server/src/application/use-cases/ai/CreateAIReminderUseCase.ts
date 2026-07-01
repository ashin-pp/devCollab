import { IAIReminderRepository } from "../../repositories/IAIReminderRepository";
import { AIReminder } from "../../../domain/entities/AIReminder";
import { ICreateReminderDependency } from "../../../infra/ai/tools/RemindTool";

export class CreateAIReminderUseCase implements ICreateReminderDependency {
    constructor(private aiReminderRepository: IAIReminderRepository) {}

    async execute(data: { userId: string; workspaceId: string; channelId: string; content: string; remindAt: string }): Promise<void> {
        const newReminder: Partial<AIReminder> = {
            userId: data.userId,
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            content: data.content,
            remindAt: new Date(data.remindAt),
            isSent: false,
            agentId: "000000000000000000000000", // placeholder or system AI agent id
            messageId: "000000000000000000000000" 
        };

        await this.aiReminderRepository.create(newReminder);
    }
}
