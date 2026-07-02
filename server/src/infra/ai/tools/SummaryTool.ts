import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { GetChannelMessagesUseCase } from "../../../application/use-cases/channel/GetChannelMessagesUseCase";

export const createSummaryTool = (getChannelMessagesUseCase: GetChannelMessagesUseCase) => {
    return tool(
        async ({}, config) => {
            const context = config?.configurable?.context;
            const userId = context?.userId;
            const channelId = context?.channelId;
            if (!userId || !channelId) {
                return "Error: Could not identify the user requesting the summary.";
            }

            const messages = await getChannelMessagesUseCase.execute(channelId, 1, 10); // Get last 10 messages
            if (!messages || messages.length === 0) return "There are no messages in this channel to summarize.";
            
            let chatHistory = messages.map(m => {
                let text = m.content || "";
                if (text.length > 150) text = text.substring(0, 150) + "...";
                return `${m.senderName || m.senderId}: ${text}`;
            }).join("\n");
            
            // Hard cap the entire chat history block
            if (chatHistory.length > 1000) {
                chatHistory = chatHistory.substring(chatHistory.length - 1000);
            }

            return `Task: Write a 2 to 3 sentence summary of the chat history below.\n\nChat History:\n${chatHistory}\n\nSummary:`;
        },
        {
            name: "summary_tool",
            description: "Generates a summary of recent channel messages. Triggered by /summary.",
            schema: z.object({}),
        }
    );
};
