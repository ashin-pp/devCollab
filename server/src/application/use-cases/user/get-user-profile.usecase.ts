import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";

import { IGetUserProfileUseCase } from "../../interfaces/use-cases/user/get-user-profile.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetUserProfileUseCase implements IGetUserProfileUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {userId: string}): Promise<UserProfileResponseDto> {
        const { userId } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio,
            skills: user.skills || [],
            github: user.github,
            linkedin: user.linkedin,
            twitter: user.twitter,
            location: user.location,
            title: user.title
        };
    }
}
