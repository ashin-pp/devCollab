import { ChannelMemberResponseDto } from "../../../dtos/channel/response/channel-member.response.dto";

export interface IGetChannelMembersUseCase {
    execute(payload: {workspaceId: string, channelId: string, requestUserId: string}): Promise<ChannelMemberResponseDto[]>;
}
