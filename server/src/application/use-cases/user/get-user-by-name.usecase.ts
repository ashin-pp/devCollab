import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { User } from "../../../domain/entities/user.entity";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class GetUserByNameUseCase implements IBaseUseCase<{name: string}, User | null> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {name: string}): Promise<User | null> {
        const { name } = payload;
        // Automatically strip leading '@' if the AI or user passes it
        const cleanName = name.startsWith('@') ? name.substring(1) : name;
        return await this._userRepository.findByName(cleanName);
    }
}
