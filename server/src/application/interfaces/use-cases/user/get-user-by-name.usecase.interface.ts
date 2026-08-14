import { UserByNameResponseDto } from "../../../dtos/user/response/user-by-name.response.dto";

export interface IGetUserByNameUseCase {
    execute(payload: { name: string }): Promise<UserByNameResponseDto | null>;
}
