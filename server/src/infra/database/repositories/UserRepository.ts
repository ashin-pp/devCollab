import { Model } from "mongoose";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { MongoBaseRepository } from "./BaseRepository";
import { IUserModel } from "../models/UserModel";
import { UserMapper } from "../../mappers/UserMapper";

export class UserRepository extends MongoBaseRepository<User, IUserModel> implements IUserRepository {
    
    constructor(model: Model<IUserModel>) {
        super(model, new UserMapper());
    }

    async findByEmail(email: string): Promise<User | null> {
        const found = await this.model.findOne({ email });
        return found ? this._mapper.toDomain(found) : null;
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        const found = await this.model.findOne({ google_id: googleId });
        return found ? this._mapper.toDomain(found) : null;
    }

    async findByName(name: string): Promise<User | null> {
        // Case-insensitive partial match
        const found = await this.model.findOne({ name: { $regex: new RegExp(name, 'i') } });
        return found ? this._mapper.toDomain(found) : null;
    }
}
