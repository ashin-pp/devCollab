import { tool } from "@langchain/core/tools";
import { z } from "zod";

export interface ICreateReminderDependency {
    execute(data: { userId: string; workspaceId: string; channelId: string; content: string; remindAt: string }): Promise<void>;
}

export const createRemindTool = (createAIReminderUseCase: ICreateReminderDependency | null) => {
    return tool(
        async ({ content, remindAt }, config) => {
            if (createAIReminderUseCase) {
                const context = config?.configurable?.context;
                const workspaceId = context?.workspaceId || "000000000000000000000000";
                const channelId = context?.channelId || "000000000000000000000000";
                const userId = context?.userId || "000000000000000000000000";
                
                await createAIReminderUseCase.execute({ userId, workspaceId, channelId, content, remindAt });
            }
            return `Reminder set for ${remindAt}.`;
        },
        {
            name: "remind_tool",
            description: "Sets a future reminder for a user. Triggered by @remind.",
            schema: z.object({
                content: z.string().describe("What to remind the user about"),
                remindAt: z.string().describe("ISO string of when to remind them"),
            }),
        }
    );
};
