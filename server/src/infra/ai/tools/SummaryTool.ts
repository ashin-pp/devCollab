import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { GetUnreadMessagesUseCase } from "../../../application/use-cases/channel/GetUnreadMessagesUseCase";

export const createSummaryTool = (getUnreadMessagesUseCase: GetUnreadMessagesUseCase) => {
    return tool(
        async ({}, config) => {
            const context = config?.configurable?.context;
            const userId = context?.userId;
            const channelId = context?.channelId;
            if (!userId || !channelId) {
                return "Error: Could not identify the user requesting the summary.";
            }

            const messages = await getUnreadMessagesUseCase.execute(channelId, userId);
            if (!messages || messages.length === 0) return "You have no unread messages in this channel to summarize.";
            
            const chatHistory = messages.map(m => `${m.senderId}: ${m.content}`).join("\n");
            return `Here is the unread chat history:\n${chatHistory}\n\nPlease provide a concise summary.`;
        },
        {
            name: "summary_tool",
            description: "Generates a summary of recent channel messages. Triggered by @summary.",
            schema: z.object({}),
        }
    );
};
