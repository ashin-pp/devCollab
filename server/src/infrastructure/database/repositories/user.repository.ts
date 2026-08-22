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
        const normalized = email.toLowerCase().trim();
        if (!normalized) return null;

        // Case-insensitive — Google / mixed-case signups must still match invite search
        const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const found = await this._model.findOne({
            email: { $regex: `^${escaped}$`, $options: "i" },
        });
        return found ? this._mapper.toDomain(found) : null;
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        const found = await this._model.findOne({ google_id: googleId });
        return found ? this._mapper.toDomain(found) : null;
    }

    async findByName(name: string): Promise<User | null> {
        const found = await this._model.findOne({ name: { $regex: new RegExp(name, 'i') } });
        return found ? this._mapper.toDomain(found) : null;
    }

    async findByIds(ids: string[]): Promise<User[]> {
        const unique = Array.from(new Set(ids.filter(Boolean)));
        if (unique.length === 0) return [];
        const found = await this._model.find({ _id: { $in: unique } });
        return found.map((doc) => this._mapper.toDomain(doc));
    }
}
