import { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors/AppError";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { jwtService } from "../../container";

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(ErrorMessage.NO_TOKEN_PROVIDED, HttpStatusCode.UNAUTHORIZED);
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new AppError(ErrorMessage.NO_TOKEN_PROVIDED, HttpStatusCode.UNAUTHORIZED);
        }
        const decoded = jwtService.verifyAccessToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        next(new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED));
    }
};
