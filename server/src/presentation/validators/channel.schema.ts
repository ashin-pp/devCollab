import { z } from "zod";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import {
    isValidChannelName,
    NAME_LIMITS,
    normalizeChannelName,
} from "../../shared/utils/name-validation.util";
import { nonEmptyString, objectIdSchema, privacySchema } from "./common.schema";

const channelNameSchema = nonEmptyString("Channel name is required")
    .min(NAME_LIMITS.CHANNEL_NAME_MIN)
    .max(NAME_LIMITS.CHANNEL_NAME_MAX)
    .transform(normalizeChannelName)
    .refine(isValidChannelName, {
        message: ErrorMessage.CHANNEL_NAME_SLUG_INVALID,
    });

export const workspaceIdParamSchema = z.object({
    workspaceId: objectIdSchema,
});

export const channelParamsSchema = z.object({
    workspaceId: objectIdSchema,
    channelId: objectIdSchema,
});

export const channelMemberParamsSchema = z.object({
    workspaceId: objectIdSchema,
    channelId: objectIdSchema,
    memberId: objectIdSchema,
});

export const channelRequestParamsSchema = z.object({
    workspaceId: objectIdSchema,
    channelId: objectIdSchema,
    userId: objectIdSchema,
});

export const createChannelBodySchema = z.object({
    name: channelNameSchema,
    description: z.string().trim().optional(),
    privacy: privacySchema.optional(),
});

export const updateChannelBodySchema = z.object({
    name: channelNameSchema.optional(),
    description: z.string().trim().optional(),
    privacy: privacySchema.optional(),
});

export const addChannelMembersBodySchema = z.object({
    userIds: z.array(objectIdSchema).min(1, "At least one user id is required"),
});

export const updateChannelRequestBodySchema = z.object({
    action: z.enum(["approve", "reject"]),
});

export const markChannelReadBodySchema = z.object({
    readUpto: z.union([z.string(), z.coerce.date()]).optional(),
});

export const sendMessageBodySchema = z
    .object({
        content: z.string().optional(),
        messageType: z.string().optional(),
        imageUrl: z.string().optional(),
        mentionedUserIds: z.array(objectIdSchema).optional(),
        parentMessageId: objectIdSchema.optional(),
        replyVisibility: z.enum(["everyone", "author"]).optional(),
    })
    .refine((data) => Boolean(data.content?.trim()) || Boolean(data.imageUrl), {
        message: ErrorMessage.MESSAGE_CONTENT_OR_IMAGE_REQUIRED,
    });

export const messagesQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});

export const threadParamsSchema = z.object({
    workspaceId: objectIdSchema,
    channelId: objectIdSchema,
    messageId: objectIdSchema,
});
