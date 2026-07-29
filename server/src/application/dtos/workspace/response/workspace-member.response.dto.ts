import { MemberRole } from "../../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../../domain/enums/MemberStatus";
import { UserProfileResponseDto } from "../../user/response/user-profile.response.dto";

export interface WorkspaceMemberResponseDto {
    id: string;
    workspaceId: string;
    userId: string;
    role: MemberRole;
    status: MemberStatus;
    joinedAt: Date;
    updatedAt?: Date;
    profile?: UserProfileResponseDto;
}
