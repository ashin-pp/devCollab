import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { ICreateAITaskUseCase } from "../../../application/interfaces/use-cases/ai/create-ai-task.usecase.interface";
import type { IGetUserByNameUseCase } from "../../../application/interfaces/use-cases/user/get-user-by-name.usecase.interface";

export const createTaskTool = (
    createAITaskUseCase: ICreateAITaskUseCase | null,
    getUserByNameUseCase?: IGetUserByNameUseCase
) => {
    return tool(
        async ({ title, description, dueDate, targetUsername }, config) => {
            if (!createAITaskUseCase) {
                return "Failed to create task: Task service is not available.";
            }

            const context = config?.configurable?.context;
            const workspaceId = context?.workspaceId;
            const channelId = context?.channelId;
            const createdBy = context?.userId;
            let assignedTo = context?.userId;

            if (!workspaceId || !channelId || !createdBy) {
                return "Failed to create task: Missing workspace/channel/user context.";
            }

            if (targetUsername && getUserByNameUseCase) {
                const targetUser = await getUserByNameUseCase.execute({ name: targetUsername });
                if (!targetUser?.id) {
                    return `Failed to create task: Could not find a user named '${targetUsername}'.`;
                }
                assignedTo = targetUser.id;
            }

            if (!assignedTo) {
                return "Failed to create task: No assignee found.";
            }

            const resolvedDueDate =
                dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            await createAITaskUseCase.execute({
                workspaceId,
                channelId,
                title,
                description: description || title,
                assignedTo,
                dueDate: resolvedDueDate,
                createdBy,
            });

            const who = targetUsername
                ? `@${String(targetUsername).replace(/^@/, "")}`
                : "you";
            return `Task created: "${title}" assigned to ${who}.`;
        },
        {
            name: "task_tool",
            description:
                "Creates a task for a workspace member. Triggered by /task. If the user mentions someone else (e.g. @ashin), pass their name as targetUsername.",
            schema: z.object({
                title: z
                    .string()
                    .describe("Short task title. Do NOT include command prefixes like '/task'."),
                description: z.string().optional().describe("Optional longer task description."),
                dueDate: z
                    .string()
                    .optional()
                    .describe(
                        "Optional ISO-8601 due date/time WITH local offset (e.g. 2026-08-22T16:00:00+05:30). Never use Z for user-local times like 4pm."
                    ),
                targetUsername: z
                    .string()
                    .optional()
                    .describe("Optional assignee name if different from the sender."),
            }),
        }
    );
};
