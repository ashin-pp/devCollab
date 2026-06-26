import { Admin } from "../../domain/../domain/entities/Admin";
import { IBaseRepository } from "./IBaseRepository";

export interface IAdminRepository extends IBaseRepository<Admin> {
    findByEmail(email: string): Promise<Admin | null>;
}
