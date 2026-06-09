import jwt from "jsonwebtoken";
import { IJwtService } from "../../domain/services/IJwtService";
import { JwtExpiry } from "../../domain/enums/JwtExpiry";

export class JwtService implements IJwtService {
    private readonly accessSecret = process.env.JWT_ACCESS_SECRET;
    private readonly refreshSecret = process.env.JWT_REFRESH_SECRET;

    generateAccessToken(userId: string, role: string): string {
        return jwt.sign({ id: userId, role }, this.accessSecret as string, {
            expiresIn: JwtExpiry.ACCESS_TOKEN
        });
    }

    generateRefreshToken(userId: string, role: string): string {
        return jwt.sign({ id: userId, role }, this.refreshSecret as string, {
            expiresIn: JwtExpiry.REFRESH_TOKEN
        });
    }

    verifyRefreshToken(token: string): any {
        try {
            return jwt.verify(token, this.refreshSecret as string);
        } catch (error) {
            throw new Error("Invalid or expired refresh token");
        }
    }
}
