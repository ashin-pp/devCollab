import { UserStatus } from "../../../../domain/enums/UserStatus";

export interface IToggleUserStatusUseCase {
    execute(payload: {userId: string}): Promise<UserStatus>;
}
