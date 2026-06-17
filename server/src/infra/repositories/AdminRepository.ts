import { Model } from "mongoose";
import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { Admin } from "../../domain/entities/Admin";
import { MongoBaseRepository } from "./BaseRepository";
import { IAdminModel } from "../database/models/AdminModel";
import { AdminMapper } from "../mappers/AdminMapper";

export class AdminRepository extends MongoBaseRepository<Admin, IAdminModel> implements IAdminRepository {
    constructor(model: Model<IAdminModel>) {
        super(model, new AdminMapper());
    }

    async findByEmail(email: string): Promise<Admin | null> {
        const found = await this.model.findOne({ email });
        return found ? this._mapper.toDomain(found) : null;
    }
}
