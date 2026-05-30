import { Request, Response, NextFunction } from "express";
import { logger } from "../../container";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    logger.error(err.message, { stack: err.stack, path: req.path });

    const errorPayload = ApiResponse.error("An unexpected server error occurred");

    res.status(500).json(errorPayload);
};
