import { z } from "zod";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { emailSchema, nonEmptyString } from "./common.schema";

export const registerBodySchema = z
    .object({
        name: nonEmptyString("Name is required").min(2).max(50),
        email: emailSchema,
        password: z.string().min(6, ErrorMessage.PASSWORD_TOO_SHORT),
        confirmPassword: z.string().min(6, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: ErrorMessage.PASSWORDS_DO_NOT_MATCH,
        path: ["confirmPassword"],
    });

export const emailBodySchema = z.object({
    email: emailSchema,
});

export const verifyOtpBodySchema = z.object({
    email: emailSchema,
    otp: nonEmptyString("OTP is required"),
});

export const loginBodySchema = z.object({
    email: emailSchema,
    password: nonEmptyString("Password is required"),
});

export const googleAuthBodySchema = z.object({
    token: nonEmptyString("Google token is required"),
});

export const resetPasswordBodySchema = z
    .object({
        email: emailSchema,
        otp: nonEmptyString("OTP is required"),
        newPassword: z.string().min(6, ErrorMessage.PASSWORD_TOO_SHORT),
        confirmPassword: z.string().min(6, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: ErrorMessage.PASSWORDS_DO_NOT_MATCH,
        path: ["confirmPassword"],
    });

export const createAdminBodySchema = z
    .object({
        name: nonEmptyString("Name is required").min(2).max(50),
        email: emailSchema,
        password: z.string().min(6, ErrorMessage.PASSWORD_TOO_SHORT),
        confirmPassword: z.string().min(6, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: ErrorMessage.PASSWORDS_DO_NOT_MATCH,
        path: ["confirmPassword"],
    });
