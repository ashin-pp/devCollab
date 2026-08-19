import { AuthResponseDto } from "../../../dtos/auth/response/auth.response.dto";

export interface IRefreshTokenUseCase {
    execute(payload: {refreshToken: string}): Promise<AuthResponseDto>;
}
