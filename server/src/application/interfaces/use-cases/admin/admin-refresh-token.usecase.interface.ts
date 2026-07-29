import { AdminAuthResponseDto } from "../../../dtos/admin/response/admin-auth.response.dto";

export interface IAdminRefreshTokenUseCase {
    execute(payload: {refreshToken: string}): Promise<AdminAuthResponseDto>;
}
