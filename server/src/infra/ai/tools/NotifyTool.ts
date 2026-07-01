import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CreateNotificationUseCase } from "../../../application/use-cases/notification/CreateNotificationUseCase";

export const createNotifyTool = (createNotificationUseCase: CreateNotificationUseCase) => {
    return tool(
        async ({ targetName, title, message }) => {
            // For testing, we just use a default ID if we don't have a lookup service
            const userId = "000000000000000000000000"; 
            await createNotificationUseCase.execute({
                userId,
                type: 'GENERAL',
                title,
                message,
            });
            return `Notification sent to user ${targetName} successfully.`;
        },
        {
            name: "notify_tool",
            description: "Sends a direct notification. Triggered by @notify.",
            schema: z.object({
                targetName: z.string().describe("The name or username of the person to notify"),
                title: z.string().describe("Notification title"),
                message: z.string().describe("Notification message"),
            }),
        }
    );
};
