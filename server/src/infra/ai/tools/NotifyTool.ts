import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CreateNotificationUseCase } from "../../../application/use-cases/notification/CreateNotificationUseCase";
import { GetUserByNameUseCase } from "../../../application/use-cases/user/GetUserByNameUseCase";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IChannelRepository } from "../../../application/repositories/IChannelRepository";

export const createNotifyTool = (
    createNotificationUseCase: CreateNotificationUseCase, 
    getUserByNameUseCase?: GetUserByNameUseCase,
    userRepository?: IUserRepository,
    channelRepository?: IChannelRepository
) => {
    return tool(
        async ({ targetName, title, message }, config) => {
            const context = config?.configurable?.context;
            let userId = context?.userId;
            
            if (targetName && targetName.toLowerCase() !== 'me' && getUserByNameUseCase) {
                const targetUser = await getUserByNameUseCase.execute(targetName);
                if (targetUser && targetUser.id) {
                    userId = targetUser.id;
                } else {
                    return `Failed to send notification: Could not find user '${targetName}'.`;
                }
            }
            
            if (!userId) return "Failed to send notification: User not authenticated.";
            
            let finalMessage = message;
            if (context?.userId && context?.channelId && userRepository && channelRepository) {
                const sender = await userRepository.findById(context.userId);
                const channel = await channelRepository.findById(context.channelId);
                if (sender && channel) {
                    finalMessage = `@${sender.name} in #${channel.name} notified you: "${message}"`;
                }
            }

            await createNotificationUseCase.execute({
                userId,
                type: 'GENERAL',
                title,
                message: finalMessage,
            });
            return `Notification sent to user ${targetName} successfully.`;
        },
        {
            name: "notify_tool",
            description: "Sends a direct notification. Triggered by /notify.",
            schema: z.object({
                targetName: z.string().describe("The name or username of the person to notify"),
                title: z.string().describe("Notification title"),
                message: z.string().describe("Notification message"),
            }),
        }
    );
};
