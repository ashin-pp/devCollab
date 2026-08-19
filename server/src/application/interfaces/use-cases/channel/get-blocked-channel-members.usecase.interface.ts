import { ChannelMemberResponseDto } from "../../../dtos/channel/response/channel-member.response.dto";

export interface IGetBlockedChannelMembersUseCase {
    execute(payload: { workspaceId: string, channelId: string, requestUserId: string }): Promise<ChannelMemberResponseDto[]>;
}
