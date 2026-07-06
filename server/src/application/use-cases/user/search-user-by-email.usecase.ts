import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";

@injectable()
export class SearchUserByEmailUseCase implements IBaseUseCase<{email: string}, Partial<UserProfileResponseDto>> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(payload: {email: string}): Promise<Partial<UserProfileResponseDto>> {
        const { email } = payload;
        if (!email) {
            throw new AppError(ErrorMessage.EMAIL_REQUIRED_FOR_SEARCH, HttpStatusCode.BAD_REQUEST);
        }

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
