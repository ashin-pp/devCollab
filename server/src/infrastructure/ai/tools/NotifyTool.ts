import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { ICreateNotificationUseCase } from "../../../application/interfaces/use-cases/notification/create-notification.usecase.interface";
import type { IGetUserByNameUseCase } from "../../../application/interfaces/use-cases/user/get-user-by-name.usecase.interface";
import { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";

export const createNotifyTool = (
    createNotificationUseCase: ICreateNotificationUseCase, 
    getUserByNameUseCase?: IGetUserByNameUseCase,
    userRepository?: IUserRepository,
    channelRepository?: IChannelRepository
) => {
    return tool(
        async ({ targetName, title, message }, config) => {
            const context = config?.configurable?.context;
            let userId = context?.userId;
            
            if (targetName && targetName.toLowerCase() !== 'me' && getUserByNameUseCase) {
                const targetUser = await getUserByNameUseCase.execute({ name: targetName });
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
