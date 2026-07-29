import { injectable } from 'tsyringe';
import jwt from "jsonwebtoken";
import { IJwtService } from "../../application/interfaces/services/jwt.service.interface";
import { envConfig } from "../../config/envConfig";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";

@injectable()
export class JwtService implements IJwtService {
    private readonly _accessSecret = process.env.JWT_ACCESS_SECRET || envConfig.jwtSecret;
    private readonly _refreshSecret = process.env.JWT_REFRESH_SECRET || envConfig.jwtSecret;

    generateAccessToken(userId: string, role: string): string {
        return jwt.sign({ id: userId, role }, this._accessSecret as string, {
            expiresIn: envConfig.jwtAccessExpiration as any
        });
    }

    generateRefreshToken(userId: string, role: string): string {
        return jwt.sign({ id: userId, role }, this._refreshSecret as string, {
            expiresIn: envConfig.jwtRefreshExpiration as any
        });
    }

    verifyRefreshToken(token: string): { id: string; role: string } {
        try {
            return jwt.verify(token, this._refreshSecret as string) as { id: string; role: string };
        } catch (_error) {
            throw new AppError(ErrorMessage.INVALID_OR_EXPIRED_REFRESH_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }
    }

    verifyAccessToken(token: string): { id: string; role: string } {
        try {
            return jwt.verify(token, this._accessSecret as string) as { id: string; role: string };
        } catch (_error) {
            throw new AppError(ErrorMessage.INVALID_OR_EXPIRED_ACCESS_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }
    }
}
