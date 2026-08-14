import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { ISendDirectMessageUseCase } from "../../../application/interfaces/use-cases/dm/send-direct-message.usecase.interface";
import type { IStartConversationUseCase } from "../../../application/interfaces/use-cases/dm/start-conversation.usecase.interface";
import { MessageType } from "../../../domain/enums/MessageType";

export const createSendDMTool = (
    sendDirectMessageUseCase: ISendDirectMessageUseCase,
    startConversationUseCase: IStartConversationUseCase
) => {
    return tool(
        async ({ content }, config) => {
            try {
                const context = config?.configurable?.context;
                if (!context || !context.userId || !context.workspaceId) {
                    return "Error: Missing context required to send a DM.";
                }

                const userId = context.userId;
                const workspaceId = context.workspaceId;

                const conversation = await startConversationUseCase.execute(workspaceId, userId, userId);
                await sendDirectMessageUseCase.execute(conversation.id as string, userId, content, MessageType.AI);
                
                return "Successfully sent the summary to the user's DM.";
            } catch (error) {
                console.error("Error in send_dm_tool:", error);
                return "Error: Failed to send the DM.";
            }
        },
        {
            name: "send_dm_tool",
            description: "Sends a direct message to the user. Use this to deliver the generated summary to the user's private messages.",
            schema: z.object({
                content: z.string().describe("The content of the message to send, which should be the generated summary."),
            }),
        }
    );
};
