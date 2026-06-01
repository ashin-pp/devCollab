import jwt from "jsonwebtoken";
import { IJwtService } from "../../application/services/IJwtService";
import { JwtExpiry } from "../../domain/enums/JwtExpiry";

export class JwtService implements IJwtService {
    private readonly accessSecret = process.env.JWT_ACCESS_SECRET || "super_secret_access_key";
    private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || "super_secret_refresh_key";

    generateAccessToken(userId: string, role: string): string {
        return jwt.sign({ id: userId, role }, this.accessSecret, {
            expiresIn: JwtExpiry.ACCESS_TOKEN
        });
    }

    generateRefreshToken(userId: string, role: string): string {
        return jwt.sign({ id: userId, role }, this.refreshSecret, {
            expiresIn: JwtExpiry.REFRESH_TOKEN
        });
    }
}
