import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { GetChannelMessagesUseCase } from "../../../application/use-cases/channel/GetChannelMessagesUseCase";

export const createSummaryTool = (getChannelMessagesUseCase: GetChannelMessagesUseCase) => {
    return tool(
        async ({ channelId }) => {
            const messages = await getChannelMessagesUseCase.execute(channelId, 1, 50);
            if (!messages || messages.length === 0) return "No messages found in this channel to summarize.";
            
            const chatHistory = messages.map(m => `${m.senderId}: ${m.content}`).join("\n");
            return `Here is the chat history:\n${chatHistory}\n\nPlease provide a concise summary.`;
        },
        {
            name: "summary_tool",
            description: "Generates a summary of recent channel messages. Triggered by @summary.",
            schema: z.object({
                channelId: z.string().describe("The ID of the channel"),
            }),
        }
    );
};
