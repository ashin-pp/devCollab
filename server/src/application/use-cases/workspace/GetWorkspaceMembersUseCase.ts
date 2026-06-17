import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";

export class GetWorkspaceMembersUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(workspaceId: string, requestUserId: string, includeProfile: boolean = false) {
        if (!workspaceId) {
            throw new AppError("Workspace not found", HttpStatusCode.BAD_REQUEST);
        }

        // Check if the user is the owner of the workspace to see pending members
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (!workspace.isActive) {
            throw new AppError(ErrorMessage.WORKSPACE_INACTIVE, HttpStatusCode.FORBIDDEN);
        }

        const currentMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
        if (currentMember?.status === 'blocked') {
            throw new AppError(ErrorMessage.MEMBER_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        const isOwner = workspace.createdBy === requestUserId;

        const members = await this.workspaceMemberRepository.findAllByWorkspaceId(workspaceId);
        
        // Filter out pending members if the request user is not the owner
        const visibleMembers = isOwner ? members : members.filter(m => m.status === 'approved');

        const membersWithDetails = await Promise.all(
            visibleMembers.map(async (member) => {
                const user = await this.userRepository.findById(member.userId);
                return {
                    id: member.id,
                    workspaceId: member.workspaceId,
                    userId: member.userId,
                    role: member.role,
                    status: member.status,
                    joinedAt: member.joinedAt,
                    user: user ? (includeProfile ? {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage,
                        bio: user.bio,
                        skills: user.skills || [],
                        github: user.github,
                        linkedin: user.linkedin,
                        twitter: user.twitter,
                        location: user.location,
                        title: user.title
                    } : {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage
                    }) : null
                };
            })
        );

        return membersWithDetails;
    }
}
