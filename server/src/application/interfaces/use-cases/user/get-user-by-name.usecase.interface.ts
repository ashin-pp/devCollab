import { User } from "../../../../domain/entities/user.entity";

export interface IGetUserByNameUseCase {
    execute(payload: {name: string}): Promise<User | null>;
}
