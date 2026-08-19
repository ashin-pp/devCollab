import { ChannelMemberRole, ChannelMemberStatus } from "../../../../domain/enums/ChannelMemberStatus";
import { UserProfileResponseDto } from "../../user/response/user-profile.response.dto";

export interface ChannelMemberResponseDto {
    id: string;
    channelId: string;
    userId: string;
    role: ChannelMemberRole;
    status: ChannelMemberStatus;
    joinedAt: Date;
    updatedAt?: Date;
    user?: UserProfileResponseDto;
}
