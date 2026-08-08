import { z } from "zod";
import { emailSchema, nonEmptyString, objectIdSchema, paginationQuerySchema, privacySchema } from "./common.schema";

export const createWorkspaceBodySchema = z.object({
    name: nonEmptyString("Workspace name is required").min(2).max(50),
    description: z.string().trim().optional(),
    logo: z.string().optional(),
    privacy: privacySchema.optional(),
    maxMembers: z.coerce.number().int().positive().optional(),
});

export const joinWorkspaceBodySchema = z.object({
    inviteCode: nonEmptyString("Invite code is required"),
    isFromEmailLink: z.boolean().optional(),
});

export const workspaceIdParamsSchema = z.object({
    id: objectIdSchema,
});

export const workspaceMemberParamsSchema = z.object({
    id: objectIdSchema,
    userId: objectIdSchema,
});

export const inviteCodeParamsSchema = z.object({
    code: nonEmptyString("Invite code is required"),
});

export const workspaceMembersQuerySchema = paginationQuerySchema.extend({
    includeProfile: z
        .union([z.literal("true"), z.literal("false")])
        .optional()
        .transform((v) => v === "true"),
});

export const handleJoinRequestBodySchema = z.object({
    action: z.enum(["approve", "reject"]),
    targetUserId: objectIdSchema,
});

export const updateWorkspaceBodySchema = z.object({
    name: z.string().trim().min(2).max(50).optional(),
    description: z.string().trim().optional(),
    logo: z.string().optional(),
    privacy: privacySchema.optional(),
    maxMembers: z.coerce.number().int().positive().optional(),
});

export const sendInviteBodySchema = z.object({
    targetEmail: emailSchema,
});
