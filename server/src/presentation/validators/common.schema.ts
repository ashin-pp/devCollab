import { z } from "zod";

export const objectIdSchema = z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid id format");

export const emailSchema = z.string().trim().email("Valid email is required");

export const nonEmptyString = (message = "This field is required") =>
    z.string().trim().min(1, message);

export const privacySchema = z.enum(["public", "private"]);

export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});
