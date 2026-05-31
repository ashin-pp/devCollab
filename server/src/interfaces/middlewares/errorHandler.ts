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

    const errorPayload = ApiResponse.error(ErrorMessage.INTERNAL_SERVER_ERROR);

    res.status(HttpStatusCode.INTERNAL_SERVER).json(errorPayload);
};
