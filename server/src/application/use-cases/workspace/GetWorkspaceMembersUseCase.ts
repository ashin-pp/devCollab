import { IWorkspaceMemberRepository } from '../../../application/repositories/IWorkspaceMemberRepository';
import { IUserRepository } from '../../../application/repositories/IUserRepository';
import { IWorkspaceRepository } from '../../../application/repositories/IWorkspaceRepository';
import { AppError } from '../../../domain/errors/AppError';
import { ErrorMessage } from '../../../domain/enums/ErrorMessage';
import { HttpStatusCode } from '../../../domain/enums/HttpStatusCode';
import { MemberStatus } from '../../../domain/enums/MemberStatus';
import { WorkspaceMemberDTO, MemberUserDTO, MemberUserFullProfileDTO } from '../../dtos/workspace/WorkspaceMemberDTO';

export class GetWorkspaceMembersUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(workspaceId: string, requestUserId: string, includeProfile: boolean = false): Promise<WorkspaceMemberDTO[]> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (!workspace.isActive) {
            throw new AppError(ErrorMessage.WORKSPACE_INACTIVE, HttpStatusCode.FORBIDDEN);
        }

        const currentMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
        if (currentMember?.status === MemberStatus.BLOCKED) {
            throw new AppError(ErrorMessage.MEMBER_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        const isOwner = workspace.createdBy === requestUserId;
        const members = await this.workspaceMemberRepository.findAllByWorkspaceId(workspaceId);
        const visibleMembers = isOwner ? members : members.filter(m => m.status === MemberStatus.APPROVED);

        const result: WorkspaceMemberDTO[] = await Promise.all(
            visibleMembers.map(async (member): Promise<WorkspaceMemberDTO> => {
                const user = await this.userRepository.findById(member.userId);

                let userDTO: MemberUserDTO | MemberUserFullProfileDTO | null = null;

                if (user) {
                    if (includeProfile) {
                        userDTO = {
                            id: user.id as string,
                            name: user.name,
                            email: user.email,
                            profileImage: user.profileImage,
                            bio: user.bio,
                            skills: user.skills ?? [],
                            github: user.github,
                            linkedin: user.linkedin,
                            twitter: user.twitter,
                            location: user.location,
                            title: user.title,
                        } satisfies MemberUserFullProfileDTO;
                    } else {
                        userDTO = {
                            id: user.id as string,
                            name: user.name,
                            email: user.email,
                            profileImage: user.profileImage,
                        } satisfies MemberUserDTO;
                    }
                }

                return {
                    id: member.id,
                    workspaceId: member.workspaceId,
                    userId: member.userId,
                    role: member.role,
                    status: member.status,
                    joinedAt: member.joinedAt,
                    user: userDTO,
                };
            })
        );

        return result;
    }
}
