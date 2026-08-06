import { AdminWalletResponseDto } from "../../../dtos/admin/response/admin-wallet.response.dto";

export interface IGetAdminWalletUseCase {
    execute(params?: { page?: number; limit?: number }): Promise<AdminWalletResponseDto>;
}
