import { z } from "zod";
import { MemberStatus } from "../../domain/enums/MemberStatus";
import { objectIdSchema, paginationQuerySchema } from "./common.schema";

const adminPlanIdFilterSchema = z.union([objectIdSchema, z.literal("none")]).optional();

export const adminUsersQuerySchema = paginationQuerySchema.extend({
    filter: z.enum(["active", "blocked"]).optional(),
    planId: adminPlanIdFilterSchema,
});

export const adminWorkspacesQuerySchema = paginationQuerySchema.extend({
    filter: z.enum(["active", "deactivated"]).optional(),
    planId: adminPlanIdFilterSchema,
});

export const adminDashboardQuerySchema = z.object({
    days: z
        .union([z.literal("7"), z.literal("30"), z.literal(7), z.literal(30)])
        .transform((v) => Number(v))
        .optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD").optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD").optional(),
});

export const adminWorkspaceMembersQuerySchema = paginationQuerySchema.extend({
    filter: z.string().optional(),
});

export const adminSalesQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
    status: z.enum(["success", "failed", "cancelled"]).optional(),
    planName: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
});

export const adminWalletQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
});

export const adminMemberStatusBodySchema = z.object({
    status: z.nativeEnum(MemberStatus),
});

export const adminWorkspaceStatusBodySchema = z.object({
    isActive: z.boolean(),
});

export const adminIdParamsSchema = z.object({
    id: objectIdSchema,
});

export const adminMemberStatusParamsSchema = z.object({
    workspaceId: objectIdSchema,
    userId: objectIdSchema,
});
