import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { GoogleAuthService } from "../../services/google-auth.service";
import { google } from "googleapis";
import { logger } from "../../../infrastructure/di/container";
import type { IGetUserByNameUseCase } from "../../../application/interfaces/use-cases/user/get-user-by-name.usecase.interface";

import { ICreateAIReminderUseCase } from "../../../application/interfaces/use-cases/ai/create-ai-reminder.usecase.interface";

export const createRemindTool = (createAIReminderUseCase: ICreateAIReminderUseCase | null, getUserByNameUseCase?: IGetUserByNameUseCase) => {
    return tool(
        async ({ content, remindAt, targetUsername }, config) => {
            if (createAIReminderUseCase) {
                const context = config?.configurable?.context;
                const workspaceId = context?.workspaceId;
                const channelId = context?.channelId;
                const senderId = context?.userId;
                let userId = context?.userId;
                
                if (targetUsername && getUserByNameUseCase) {
                    const targetUser = await getUserByNameUseCase.execute({ name: targetUsername });
                    if (targetUser && targetUser.id) {
                        userId = targetUser.id;
                    } else {
                        return `Failed to set reminder: Could not find a user named '${targetUsername}'.`;
                    }
                }
                
                if (!userId) return "Failed to set reminder: User not authenticated.";
                
                await createAIReminderUseCase.execute({ userId, workspaceId, channelId, content, remindAt, senderId });
                
                try {
                    const authClient = await GoogleAuthService.authorize();
                    const calendar = google.calendar({ version: 'v3', auth: authClient as any });
                    
                    const eventStartTime = new Date(remindAt);
                    const eventEndTime = new Date(eventStartTime.getTime() + 30 * 60000);
                    
                    await calendar.events.insert({
                        calendarId: 'primary',
                        requestBody: {
                            summary: `Reminder: ${content}`,
                            description: `Created via devCollab AI Assistant`,
                            start: {
                                dateTime: eventStartTime.toISOString(),
                            },
                            end: {
                                dateTime: eventEndTime.toISOString(),
                            },
                            reminders: {
                                useDefault: true,
                            },
                        },
                    });
                } catch (_err: any) {
                    return `Reminder set for ${remindAt} internally, but Google Calendar sync failed.`;
                }
            }
            return `Reminder set for ${remindAt}.`;
        },
        {
            name: "remind_tool",
            description: "Sets a future reminder for a user. Triggered by /remind. If the user mentions someone else (e.g., @ashin), pass their name as targetUsername.",
            schema: z.object({
                content: z.string().describe("What to remind the user about. IMPORTANT: Extract ONLY the core subject. Do NOT include command prefixes like 'remind him to' or 'remind me to'."),
                remindAt: z.string().describe("ISO string of when to remind them"),
                targetUsername: z.string().optional().describe("Optional: The name of the user to remind, if it is someone other than the sender"),
            }),
        }
    );
};
