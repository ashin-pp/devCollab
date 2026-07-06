import { injectable } from 'tsyringe';
import { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { User } from "../../../domain/entities/user.entity";
import { MongoBaseRepository } from "./base.repository";
import { IUserModel } from "../models/user.model";
import { UserMapper } from "../mappers/user.mapper";
import { UserModel } from "../models/user.model";

@injectable()
export class UserRepository extends MongoBaseRepository<User, IUserModel> implements IUserRepository {
    
    constructor() {
        super(UserModel, new UserMapper());
    }

    async findByEmail(email: string): Promise<User | null> {
        const found = await this._model.findOne({ email });
        return found ? this._mapper.toDomain(found) : null;
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        const found = await this._model.findOne({ google_id: googleId });
        return found ? this._mapper.toDomain(found) : null;
    }

    async findByName(name: string): Promise<User | null> {
        // Case-insensitive partial match
        const found = await this._model.findOne({ name: { $regex: new RegExp(name, 'i') } });
        return found ? this._mapper.toDomain(found) : null;
    }
}
