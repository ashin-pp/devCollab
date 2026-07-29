import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { ChangePasswordUseCase } from "../../../application/use-cases/user/change-password.usecase";
import { DeleteProfileImageUseCase } from "../../../application/use-cases/user/delete-profile-image.usecase";
import { GetUserByNameUseCase } from "../../../application/use-cases/user/get-user-by-name.usecase";
import { GetUserProfileUseCase } from "../../../application/use-cases/user/get-user-profile.usecase";
import { RequestEmailChangeUseCase } from "../../../application/use-cases/user/request-email-change.usecase";
import { SearchUserByEmailUseCase } from "../../../application/use-cases/user/search-user-by-email.usecase";
import { UpdateUserProfileUseCase } from "../../../application/use-cases/user/update-user-profile.usecase";
import { UploadProfileImageUseCase } from "../../../application/use-cases/user/upload-profile-image.usecase";
import { VerifyEmailChangeUseCase } from "../../../application/use-cases/user/verify-email-change.usecase";

export function registerUserUseCases() {
    container.register(USECASE_TOKENS.IChangePasswordUseCase, { useClass: ChangePasswordUseCase });
    container.register(USECASE_TOKENS.IDeleteProfileImageUseCase, { useClass: DeleteProfileImageUseCase });
    container.register(USECASE_TOKENS.IGetUserByNameUseCase, { useClass: GetUserByNameUseCase });
    container.register(USECASE_TOKENS.IGetUserProfileUseCase, { useClass: GetUserProfileUseCase });
    container.register(USECASE_TOKENS.IRequestEmailChangeUseCase, { useClass: RequestEmailChangeUseCase });
    container.register(USECASE_TOKENS.ISearchUserByEmailUseCase, { useClass: SearchUserByEmailUseCase });
    container.register(USECASE_TOKENS.IUpdateUserProfileUseCase, { useClass: UpdateUserProfileUseCase });
    container.register(USECASE_TOKENS.IUploadProfileImageUseCase, { useClass: UploadProfileImageUseCase });
    container.register(USECASE_TOKENS.IVerifyEmailChangeUseCase, { useClass: VerifyEmailChangeUseCase });
}
