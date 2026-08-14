import { z } from "zod";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { nonEmptyString, objectIdSchema } from "./common.schema";

export const startConversationParamsSchema = z.object({
    workspaceId: objectIdSchema,
});

export const startConversationBodySchema = z.object({
    receiverId: objectIdSchema,
});

export const conversationParamsSchema = z.object({
    conversationId: objectIdSchema,
});

export const sendDmBodySchema = z.object({
    content: nonEmptyString("Message content is required").optional(),
    imageUrl: z.string().optional(),
}).refine((data) => Boolean(data.content?.trim()) || Boolean(data.imageUrl), {
    message: ErrorMessage.MESSAGE_CONTENT_OR_IMAGE_REQUIRED,
});

export const dmMessagesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().optional(),
    skip: z.coerce.number().int().nonnegative().optional(),
});
