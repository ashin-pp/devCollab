import winston from "winston";
import { ILogger } from "../../application/services/ILogger";

export class WinstonLogger implements ILogger {

    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
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
        this.logger.info(message, meta);
    }

    warn(
        message: string,
        meta?: Record<string, unknown>
    ): void {
        this.logger.warn(message, meta);
    }

    error(
        message: string,
        meta?: Record<string, unknown>
    ): void {
        this.logger.error(message, meta);
    }

    debug(
        message: string,
        meta?: Record<string, unknown>
    ): void {
        this.logger.debug(message, meta);
    }
}
