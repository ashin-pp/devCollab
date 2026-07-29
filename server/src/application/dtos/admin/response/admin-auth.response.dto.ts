import { AdminResponseDto } from "./admin.response.dto";

export interface AdminAuthResponseDto {
    admin: AdminResponseDto;
    accessToken: string;
    refreshToken?: string;
}
