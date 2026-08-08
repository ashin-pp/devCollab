import { z } from "zod";
import { nonEmptyString, objectIdSchema } from "./common.schema";

export const processAiBodySchema = z.object({
    input: nonEmptyString("Input is required"),
    workspaceId: objectIdSchema,
    channelId: objectIdSchema,
});

export const aiDashboardQuerySchema = z.object({
    workspaceId: objectIdSchema,
});

export const clearAiDashboardBodySchema = z.object({
    workspaceId: objectIdSchema,
    tab: z.enum(["tasks", "reminders", "notifications", "schedule"]),
});

export const updateAiTaskStatusParamsSchema = z.object({
    taskId: objectIdSchema,
});

export const updateAiTaskStatusBodySchema = z.object({
    workspaceId: objectIdSchema,
    status: z.enum(["open", "in_progress", "done", "cancelled"]),
});
