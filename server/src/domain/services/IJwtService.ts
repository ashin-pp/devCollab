export interface IJwtService {
    generateAccessToken(userId: string, role: string): string;
    generateRefreshToken(userId: string, role: string): string;
    verifyRefreshToken(token: string): any;
}
