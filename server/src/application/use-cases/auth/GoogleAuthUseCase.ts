import { OAuth2Client } from "google-auth-library";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IJwtService } from "../../services/IJwtService";
import { User } from "../../../domain/entities/User";
import { GoogleAuthDto } from "../../dto/GoogleAuthDto";

export class GoogleAuthUseCase {
    private client: OAuth2Client

    constructor(
        private userRepository: IUserRepository,
        private jwtService: IJwtService
    ) {
        this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    async execute(data: GoogleAuthDto): Promise<{ user: User, accessToken: string, refreshToken: string }> {
        const ticket = await this.client.verifyIdToken({
            idToken: data.token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new Error("Invalid Google Token");
        }

        const { email, name, sub: googleId, picture } = payload;

        let user = await this.userRepository.findByEmail(email);

        if (!user) {
            const newUser = new User(
                name || "Google User",
                email,
                undefined,
                picture
            );

            newUser.googleId = googleId;
            newUser.isVerified = true;

            user = await this.userRepository.create(newUser);
        } else if (!user.googleId) {
            user.googleId = googleId

            user.isVerified = true
            if (user.id) await this.userRepository.update(user.id, user);
        }

        if (user.status === "blocked") {
            throw new Error("Your account has been blocked.");
        }

        const role = 'user';
        const accessToken = this.jwtService.generateAccessToken(user.id!, role)

        const refreshToken = this.jwtService.generateRefreshToken(user.id!, role)

        return { user, accessToken, refreshToken };
    }
}
