import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";
import { ISearchUserByEmailUseCase } from "../../interfaces/use-cases/user/search-user-by-email.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class SearchUserByEmailUseCase implements ISearchUserByEmailUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(payload: {email: string}): Promise<Partial<UserProfileResponseDto>> {
        const { email } = payload;

        const user = await this._userRepository.findByEmail(email.toLowerCase());

        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND_WITH_EMAIL, HttpStatusCode.NOT_FOUND);
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio
        };
    }
}
