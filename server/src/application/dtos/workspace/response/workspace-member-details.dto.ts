import { MemberRole } from "../../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../../domain/enums/MemberStatus";

export interface MemberUserResponseDto {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
}

export interface MemberUserFullProfileResponseDto extends MemberUserResponseDto {
    bio?: string;
    skills: string[];
    github?: string;
    linkedin?: string;
    twitter?: string;
    location?: string;
    title?: string;
}

export interface WorkspaceMemberResponseDto {
    id?: string;
    workspaceId: string;
    userId: string;
    role: MemberRole;
    status: MemberStatus;
    joinedAt?: Date;
    user: MemberUserResponseDto | MemberUserFullProfileResponseDto | null;
}
