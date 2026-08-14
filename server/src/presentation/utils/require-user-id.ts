import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export function requireUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
    }
    return userId;
}
