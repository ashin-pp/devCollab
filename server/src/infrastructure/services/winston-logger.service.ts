import { injectable } from 'tsyringe';
import winston from "winston";
import { ILogger } from "../../application/interfaces/services/logger.service.interface";

@injectable()
export class WinstonLogger implements ILogger {

    private _logger: winston.Logger;

    constructor() {
        this._logger = winston.createLogger({
            level: "debug",

            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp(),
                winston.format.json()
            ),

            transports: [
                new winston.transports.File({
                    filename: "logs/error.log",
                    level: "error"
                }),

                new winston.transports.File({
                    filename: "logs/combined.log"
                }),

                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message, stack }) => {
                            return `${timestamp} ${level}: ${message}${stack ? '\n' + stack : ''}`;
                        })
                    )
                })
            ]
        });
    }

    info(
        message: string,
        meta?: Record<string, unknown>
    ): void {
        this._logger.info(message, meta);
    }

    warn(
        message: string,
        meta?: Record<string, unknown>
    ): void {
        this._logger.warn(message, meta);
    }

    error(
        message: string,
        meta?: Record<string, unknown>
    ): void {
        this._logger.error(message, meta);
    }

    debug(
        message: string,
        meta?: Record<string, unknown>
    ): void {
        this._logger.debug(message, meta);
    }
}
