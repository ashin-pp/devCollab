import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CreateNotificationUseCase } from "../../../application/use-cases/notification/CreateNotificationUseCase";

export const createNotifyTool = (createNotificationUseCase: CreateNotificationUseCase) => {
    return tool(
        async ({ userId, title, message }) => {
            await createNotificationUseCase.execute({
                userId,
                type: 'GENERAL',
                title,
                message,
            });
            return `Notification sent to user ${userId} successfully.`;
        },
        {
            name: "notify_tool",
            description: "Sends a direct notification. Triggered by @notify.",
            schema: z.object({
                userId: z.string().describe("The ID of the user to notify"),
                title: z.string().describe("Notification title"),
                message: z.string().describe("Notification message"),
            }),
        }
    );
};
