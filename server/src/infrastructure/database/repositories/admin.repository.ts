import { injectable } from 'tsyringe';
import { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import { Admin } from "../../../domain/entities/admin.entity";
import { MongoBaseRepository } from "./base.repository";
import { IAdminModel } from "../models/admin.model";
import { AdminMapper } from "../mappers/admin.mapper";
import { AdminModel } from "../models/admin.model";

@injectable()
export class AdminRepository extends MongoBaseRepository<Admin, IAdminModel> implements IAdminRepository {
    constructor() {
        super(AdminModel, new AdminMapper());
    }

    async findByEmail(email: string): Promise<Admin | null> {
        const found = await this._model.findOne({ email });
        return found ? this._mapper.toDomain(found) : null;
    }
}
