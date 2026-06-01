import { Request, Response, NextFunction } from "express";
import { logger } from "../../container";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    logger.error(err.message, { stack: err.stack, path: req.path });

    // Check if the error is a known domain error message
    const isDomainError = Object.values(ErrorMessage).includes(err.message as any);

    const message = isDomainError ? err.message : ErrorMessage.INTERNAL_SERVER_ERROR;
    const statusCode = isDomainError ? HttpStatusCode.BAD_REQUEST : HttpStatusCode.INTERNAL_SERVER;

    const errorPayload = ApiResponse.error(message);

    res.status(statusCode).json(errorPayload);
};
