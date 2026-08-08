import { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";

type RequestValidationSchema = {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
};

function firstZodMessage(error: ZodError): string {
    const issue = error.issues[0];
    return issue?.message || ErrorMessage.VALIDATION_FAILED;
}

/** Express 5 exposes query/params as getters — redefine instead of assigning. */
function setRequestProperty<T>(req: Request, key: "query" | "params", value: T): void {
    Object.defineProperty(req, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}

/**
 * Request-boundary validation. Parses and replaces body/query/params with validated values.
 */
export const validate = (schema: RequestValidationSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.query) {
                setRequestProperty(req, "query", schema.query.parse(req.query));
            }
            if (schema.params) {
                setRequestProperty(req, "params", schema.params.parse(req.params));
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                next(new AppError(firstZodMessage(error), HttpStatusCode.BAD_REQUEST));
                return;
            }
            next(error);
        }
    };
};
