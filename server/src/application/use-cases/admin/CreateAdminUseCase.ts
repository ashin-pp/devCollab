import { IAdminRepository } from "../../../application/repositories/IAdminRepository";
import { IHashService } from "../../../application/services/IHashService";
import { Admin } from "../../../domain/entities/Admin";
import { RegisterUserDto } from "../../dto/RegisterUserDto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class CreateAdminUseCase {
    constructor(
        private adminRepository: IAdminRepository,
        private hashService: IHashService
    ) { }

    async execute(data: RegisterUserDto): Promise<Admin> {
        const existingAdmin = await this.adminRepository.findByEmail(data.email);
        if (existingAdmin) {
            throw new Error(ErrorMessage.EMAIL_ALREADY_EXISTS);
        }

        if (!data.password || data.password.trim().length < 6) {
            throw new Error(ErrorMessage.PASSWORD_TOO_SHORT);
        }

        if (data.password !== data.confirmPassword) {
            throw new Error(ErrorMessage.PASSWORDS_DO_NOT_MATCH);
        }

        const hashedPassword = await this.hashService.hash(data.password!);

        const newAdmin = new Admin(
            data.name,
            data.email,
            hashedPassword
        );

        return await this.adminRepository.create(newAdmin);
    }
}
