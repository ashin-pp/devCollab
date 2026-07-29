import { User } from "../../../domain/entities/user.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findByName(name: string): Promise<User | null>;
}
