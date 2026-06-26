import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class AdminGetWorkspaceMembersUseCase {
    constructor(
        private workspaceMemberRepository: IWorkspaceMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(workspaceId: string): Promise<any[]> {
        const members = await this.workspaceMemberRepository.findAllByWorkspaceId(workspaceId);
        
        const populatedMembers = await Promise.all(members.map(async (member) => {
            const user = await this.userRepository.findById(member.userId);
            return {
                id: member.id,
                userId: member.userId,
                role: member.role,
                status: member.status,
                joinedAt: member.joinedAt,
                userName: user?.name || 'Unknown',
                userEmail: user?.email || 'Unknown',
                userAvatar: user?.profileImage || null
            };
        }));

        return populatedMembers;
    }
}
