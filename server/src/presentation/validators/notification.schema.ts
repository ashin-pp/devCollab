import { z } from "zod";
import { objectIdSchema } from "./common.schema";

export const notificationIdParamsSchema = z.object({
    id: objectIdSchema,
});
