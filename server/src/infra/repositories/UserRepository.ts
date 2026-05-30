import { Model } from "mongoose";
import { IUserRepository } from "../../application/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { MongoBaseRepository } from "./BaseRepository";
import { IUserModel } from "../database/models/UserModel";
import { UserMapper } from "../mappers/UserMapper";

export class UserRepository extends MongoBaseRepository<User, IUserModel> implements IUserRepository {
    
    constructor(model: Model<IUserModel>) {
        super(model, new UserMapper());
    }

    async findByEmail(email: string): Promise<User | null> {
        const found = await this.model.findOne({ email });
        return found ? this.mapper.toDomain(found) : null;
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        const found = await this.model.findOne({ google_id: googleId });
        return found ? this.mapper.toDomain(found) : null;
    }
}
