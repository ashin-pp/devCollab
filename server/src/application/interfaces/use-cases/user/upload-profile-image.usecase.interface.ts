import { UserProfileResponseDto } from "../../../dtos/user/response/user-profile.response.dto";

export interface IUploadProfileImageUseCase {
    execute(payload: {userId: string, fileBuffer: Buffer, fileName: string, contentType: string}): Promise<UserProfileResponseDto>;
}
