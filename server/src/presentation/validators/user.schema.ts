import { z } from "zod";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { emailSchema, nonEmptyString, objectIdSchema } from "./common.schema";

export const updateProfileBodySchema = z.object({
    name: z.string().trim().min(2).max(50).optional(),
    bio: z.string().trim().optional(),
    phone: z.string().trim().optional(),
}).passthrough();

export const selectPlanBodySchema = z.object({
    planId: z.union([objectIdSchema, z.null()]),
});

export const changePasswordBodySchema = z
    .object({
        currentPassword: nonEmptyString("Current password is required"),
        newPassword: z.string().min(6, ErrorMessage.PASSWORD_TOO_SHORT),
        confirmPassword: z.string().min(6, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: ErrorMessage.PASSWORDS_DO_NOT_MATCH,
        path: ["confirmPassword"],
    });

export const requestEmailChangeBodySchema = z.object({
    newEmail: emailSchema,
});

export const verifyEmailChangeBodySchema = z.object({
    newEmail: emailSchema,
    otp: nonEmptyString("OTP is required"),
});

export const searchByEmailQuerySchema = z.object({
    email: emailSchema,
});
