import { z } from "zod";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { objectIdSchema } from "./common.schema";

export const startConversationParamsSchema = z.object({
    workspaceId: objectIdSchema,
});

export const startConversationBodySchema = z.object({
    receiverId: objectIdSchema,
});

export const conversationParamsSchema = z.object({
    conversationId: objectIdSchema,
});

export const sendDmBodySchema = z
    .object({
        content: z.string().optional().default(""),
        messageType: z.enum(["text", "image", "ai"]).optional().default("text"),
        imageUrl: z.union([z.string().min(1), z.literal(""), z.undefined()]).optional(),
    })
    .transform((data) => ({
        ...data,
        content: data.content?.trim() ?? "",
        imageUrl: data.imageUrl?.trim() || undefined,
    }))
    .refine((data) => Boolean(data.content) || Boolean(data.imageUrl), {
        message: ErrorMessage.MESSAGE_CONTENT_OR_IMAGE_REQUIRED,
    });

export const dmMessagesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().optional(),
    skip: z.coerce.number().int().nonnegative().optional(),
});
