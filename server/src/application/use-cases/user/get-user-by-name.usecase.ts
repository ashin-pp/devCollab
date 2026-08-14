import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { UserByNameResponseDto } from "../../dtos/user/response/user-by-name.response.dto";
import { IGetUserByNameUseCase } from "../../interfaces/use-cases/user/get-user-by-name.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetUserByNameUseCase implements IGetUserByNameUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: { name: string }): Promise<UserByNameResponseDto | null> {
        const { name } = payload;
        const cleanName = name.startsWith('@') ? name.substring(1) : name;
        const user = await this._userRepository.findByName(cleanName);
        if (!user?.id) {
            return null;
        }
        return {
            id: user.id,
            name: user.name,
        };
    }
}
