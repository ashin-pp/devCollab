import { GoogleAuthRequestDto } from "../../../dtos/auth/request/google-auth.dto";
import { AuthResponseDto } from "../../../dtos/auth/response/auth.response.dto";

export interface IGoogleAuthUseCase {
    execute(payload: GoogleAuthRequestDto): Promise<AuthResponseDto>;
}
