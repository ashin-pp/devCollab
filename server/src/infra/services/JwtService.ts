import jwt from "jsonwebtoken";
import { IJwtService } from "../../application/services/IJwtService";
import { JwtExpiry } from "../../domain/enums/JwtExpiry";

export class JwtService implements IJwtService {
    private readonly _accessSecret = process.env.JWT_ACCESS_SECRET;
    private readonly _refreshSecret = process.env.JWT_REFRESH_SECRET;

    generateAccessToken(userId: string, role: string): string {
        return jwt.sign({ id: userId, role }, this._accessSecret as string, {
            expiresIn: JwtExpiry.ACCESS_TOKEN
        });
    }

    generateRefreshToken(userId: string, role: string): string {
        return jwt.sign({ id: userId, role }, this._refreshSecret as string, {
            expiresIn: JwtExpiry.REFRESH_TOKEN
        });
    }

    verifyRefreshToken(token: string): { id: string; role: string } {
        try {
            return jwt.verify(token, this._refreshSecret as string) as { id: string; role: string };
        } catch (error) {
            throw new Error("Invalid or expired refresh token");
        }
    }

    verifyAccessToken(token: string): { id: string; role: string } {
        try {
            return jwt.verify(token, this._accessSecret as string) as { id: string; role: string };
        } catch (error) {
            throw new Error("Invalid or expired access token");
        }
    }
}
