import { IUserRepository } from "../../repositories/IUserRepository";
import { User } from "../../../domain/entities/User";

export class GetUserByNameUseCase {
    constructor(private userRepository: IUserRepository) {}

    async execute(name: string): Promise<User | null> {
        // Automatically strip leading '@' if the AI or user passes it
        const cleanName = name.startsWith('@') ? name.substring(1) : name;
        return await this.userRepository.findByName(cleanName);
    }
}
