import { IUserRepository } from "../../repositories/IUserRepository";
import { IHashService } from "../../services/IHashService";
import { RegisterUserDto } from "../../dto/RegisterUserDto";
import { User } from "../../../domain/entities/User";

export class RegisterUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private hashService: IHashService
    ) { }

    async execute(data: RegisterUserDto): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(data.email)
        if (existingUser) {
            throw new Error("User with this email already exists!");
        }
        let hashedPassword = data.password
        if (data.password) {
            hashedPassword = await this.hashService.hash(data.password)
        }
        const newUser = new User(
            data.name,
            data.username,
            data.email,
            hashedPassword
        );
        const savedUser = await this.userRepository.create(newUser);

        return savedUser;
    }
}