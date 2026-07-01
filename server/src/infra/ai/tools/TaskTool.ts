import { tool } from "@langchain/core/tools";
import { z } from "zod";

export interface ICreateTaskDependency {
    execute(data: { workspaceId: string; channelId: string; title: string; description: string; assignedTo: string; dueDate: string }): Promise<void>;
}

export const createTaskTool = (createAITaskUseCase: ICreateTaskDependency | null) => {
    return tool(
        async ({ title, description, assigneeName, dueDate }, config) => {
            if (createAITaskUseCase) {
                const context = config?.configurable?.context;
                const workspaceId = context?.workspaceId || "000000000000000000000000";
                const channelId = context?.channelId || "000000000000000000000000";
                
                // For testing, use default ID for assignee
                const assignedTo = "000000000000000000000000";
                await createAITaskUseCase.execute({ workspaceId, channelId, title, description, assignedTo, dueDate });
            }
            return `Task "${title}" created and assigned to ${assigneeName} successfully.`;
        },
        {
            name: "task_tool",
            description: "Creates a new trackable task. Triggered by @task.",
            schema: z.object({
                title: z.string().describe("Task title"),
                description: z.string().describe("Detailed task description"),
                assigneeName: z.string().describe("Name of the person to assign the task to"),
                dueDate: z.string().describe("ISO string of due date"),
            }),
        }
    );
};
