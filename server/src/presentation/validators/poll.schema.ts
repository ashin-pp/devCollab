import { z } from "zod";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { nonEmptyString, objectIdSchema } from "./common.schema";

const optionalDateSchema = z.string().datetime().or(z.coerce.date()).optional();

export const createPollBodySchema = z
    .object({
        workspaceId: objectIdSchema,
        channelId: objectIdSchema.optional(),
        question: nonEmptyString("Question is required"),
        options: z.array(nonEmptyString("Option cannot be empty")).min(2, "At least 2 options required"),
        expiresAt: optionalDateSchema,
        startsAt: optionalDateSchema,
    })
    .refine(
        (data) => {
            if (!data.expiresAt) return true;
            return new Date(data.expiresAt).getTime() > Date.now();
        },
        { message: ErrorMessage.POLL_EXPIRY_MUST_BE_FUTURE, path: ["expiresAt"] }
    )
    .refine(
        (data) => {
            if (!data.startsAt || !data.expiresAt) return true;
            return new Date(data.startsAt).getTime() < new Date(data.expiresAt).getTime();
        },
        { message: ErrorMessage.POLL_EXPIRY_AFTER_START, path: ["expiresAt"] }
    );

export const votePollBodySchema = z.object({
    optionId: nonEmptyString("optionId is required"),
});

export const pollIdParamsSchema = z.object({
    id: objectIdSchema,
});

export const workspacePollParamsSchema = z.object({
    workspaceId: objectIdSchema,
});

export const channelPollParamsSchema = z.object({
    channelId: objectIdSchema,
});
