import { Admin } from "../../../domain/entities/admin.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface IAdminRepository extends IBaseRepository<Admin> {
    findByEmail(email: string): Promise<Admin | null>;
}
