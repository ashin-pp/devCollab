import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { IGetChannelMessagesUseCase } from "../../../application/interfaces/use-cases/channel/get-channel-messages.usecase.interface";
import type { IGetUnreadMessagesUseCase } from "../../../application/interfaces/use-cases/channel/get-unread-messages.usecase.interface";

const isSummarizable = (message: { messageType?: string; content?: string }) => {
    if (message.messageType === "system") return false;
    const content = String(message.content || "").trim();
    if (!content) return false;
    if (/^\/(summary|task|notify|remind|schedule|help)\b/i.test(content)) return false;
    return true;
};

export const createSummaryTool = (
    getUnreadMessagesUseCase: IGetUnreadMessagesUseCase,
    getChannelMessagesUseCase?: IGetChannelMessagesUseCase
) => {
    return tool(
        async (_args, config) => {
            try {
                const context = config?.configurable?.context;
                const userId = context?.userId;
                const channelId = context?.channelId;
                if (!userId || !channelId) {
                    return "SUMMARY_STATUS:ERROR\nMESSAGE:Missing user or channel context.";
                }

                const unreadMessages = await getUnreadMessagesUseCase.execute({
                    channelId,
                    userId
                });
                let messages = (unreadMessages || []).filter(isSummarizable).slice(-20);
                let usedUnread = messages.length > 0;

                if (!usedUnread && getChannelMessagesUseCase) {
                    const recent = await getChannelMessagesUseCase.execute({
                        channelId,
                        page: 1,
                        limit: 30,
                        viewerId: userId,
                    });
                    messages = [...recent].reverse().filter(isSummarizable).slice(-20);
                }

                if (messages.length === 0) {
                    return "SUMMARY_STATUS:NO_UNREAD\nMESSAGE:There are no messages to summarize in this channel yet.";
                }

                let chatHistory = messages.map(m => {
                    let text = m.content || "";
                    if (text.length > 150) text = text.substring(0, 150) + "...";
                    return `${m.senderName || m.senderId}: ${text}`;
                }).join("\n");

                if (chatHistory.length > 1000) {
                    chatHistory = chatHistory.substring(chatHistory.length - 1000);
                }

                const status = usedUnread ? "HAS_UNREAD" : "HAS_RECENT";
                const task = usedUnread
                    ? "Write a 2 to 3 sentence summary of the unread chat history below."
                    : "There were no unread messages. Write a 2 to 3 sentence summary of the recent chat history below.";

                return `SUMMARY_STATUS:${status}\nMESSAGE_COUNT:${messages.length}\nTASK:${task}\n\nChat History:\n${chatHistory}\n\nSummary:`;
            } catch (error) {
                console.error("Error in summary_tool:", error);
                return "SUMMARY_STATUS:ERROR\nMESSAGE:Could not fetch unread messages for this channel.";
            }
        },
        {
            name: "summary_tool",
            description: "Generates a summary of unread channel messages since the user's last read point, falling back to recent messages when none are unread. Triggered by /summary.",
            schema: z.object({}),
        }
    );
};
