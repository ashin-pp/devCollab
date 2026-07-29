import { UserResponseDto } from "./user.response.dto";

export interface AuthResponseDto {
    user: UserResponseDto;
    accessToken: string;
    refreshToken?: string;
}
