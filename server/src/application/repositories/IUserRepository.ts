import { User } from "../../domain/../domain/entities/User";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
} 
