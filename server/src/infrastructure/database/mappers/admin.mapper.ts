import { Admin } from "../../../domain/entities/admin.entity";
import { IMapper } from "../../../application/interfaces/IMapper";
import { IAdminModel } from "../models/admin.model";

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

    toPersistence(domain: Partial<Admin>): Partial<IAdminModel> {
        const persistence: Partial<IAdminModel> = {
            name: domain.name,
            email: domain.email,
            password: domain.password
        };

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IAdminModel>;
    }
}
