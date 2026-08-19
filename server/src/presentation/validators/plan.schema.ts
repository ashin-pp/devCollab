import { z } from "zod";
import { nonEmptyString, objectIdSchema } from "./common.schema";

export const planIdParamsSchema = z.object({
    id: objectIdSchema,
});

export const createPlanBodySchema = z.object({
    name: nonEmptyString("Plan name is required"),
    price: z.coerce.number().nonnegative("Price must be 0 or greater"),
    currency: z.string().trim().optional(),
    durationDays: z.coerce.number().int().positive("Duration days is required"),
    maxWorkspaces: z.coerce.number().int().positive("maxWorkspaces is required"),
    maxMembersPerWorkspace: z.coerce.number().int().positive("maxMembersPerWorkspace is required"),
    messageRetentionDays: z.coerce.number().int().positive("messageRetentionDays is required"),
    aiAssistantEnabled: z.boolean().optional(),
    videoCallsEnabled: z.boolean().optional(),
    multiAiAgents: z.boolean().optional(),
    pinBoardEnabled: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export const updatePlanBodySchema = createPlanBodySchema;
