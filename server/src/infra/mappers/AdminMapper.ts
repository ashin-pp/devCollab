import { Admin } from "../../domain/entities/Admin";
import { IMapper } from "./IMapper";
import { IAdminModel } from "../database/models/AdminModel";

export class AdminMapper implements IMapper<Admin, IAdminModel> {
    toDomain(persistence: IAdminModel): Admin {
        return new Admin(
            persistence.name,
            persistence.email,
            persistence.password,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<Admin>): any {
        return {
            name: domain.name,
            email: domain.email,
            password: domain.password
        };
    }
}
