import { MemberRole } from '../../../domain/enums/MemberRole';
import { MemberStatus } from '../../../domain/enums/MemberStatus';

export interface MemberUserDTO {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
}

export interface MemberUserFullProfileDTO extends MemberUserDTO {
    bio?: string;
    skills: string[];
    github?: string;
    linkedin?: string;
    twitter?: string;
    location?: string;
    title?: string;
}

export interface WorkspaceMemberDTO {
    id?: string;
    workspaceId: string;
    userId: string;
    role: MemberRole;
    status: MemberStatus;
    joinedAt?: Date;
    user: MemberUserDTO | MemberUserFullProfileDTO | null;
}
