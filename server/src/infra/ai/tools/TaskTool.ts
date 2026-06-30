import { tool } from "@langchain/core/tools";
import { z } from "zod";

export interface ICreateTaskDependency {
    execute(data: { workspaceId: string; channelId: string; title: string; description: string; assignedTo: string; dueDate: string }): Promise<void>;
}

export const createTaskTool = (createAITaskUseCase: ICreateTaskDependency | null) => {
    return tool(
        async ({ workspaceId, channelId, title, description, assignedTo, dueDate }) => {
            if (createAITaskUseCase) {
                await createAITaskUseCase.execute({ workspaceId, channelId, title, description, assignedTo, dueDate });
            }
            return `Task "${title}" created and assigned to ${assignedTo} successfully.`;
        },
        {
            name: "task_tool",
            description: "Creates a new trackable task. Triggered by @task.",
            schema: z.object({
                workspaceId: z.string(),
                channelId: z.string(),
                title: z.string().describe("Task title"),
                description: z.string().describe("Detailed task description"),
                assignedTo: z.string().describe("User ID of the assignee"),
                dueDate: z.string().describe("ISO string of due date"),
            }),
        }
    );
};
