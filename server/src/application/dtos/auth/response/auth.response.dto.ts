import { UserResponseDto } from "./user.response.dto";

export interface AuthResponseDto {
    user: UserResponseDto;
    accessToken: string;
    refreshToken?: string;
    /** Present after Google auth when the account was just created. */
    isNewUser?: boolean;
}
