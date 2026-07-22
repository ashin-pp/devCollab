import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { User } from "../../../domain/entities/user.entity";
import { IGetUserByNameUseCase } from "../../interfaces/use-cases/user/get-user-by-name.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetUserByNameUseCase implements IGetUserByNameUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {name: string}): Promise<User | null> {
        const { name } = payload;
        // Automatically strip leading '@' if the AI or user passes it
        const cleanName = name.startsWith('@') ? name.substring(1) : name;
        return await this._userRepository.findByName(cleanName);
    }
}
