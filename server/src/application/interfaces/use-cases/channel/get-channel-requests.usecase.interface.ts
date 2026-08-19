import { ChannelMemberResponseDto } from "../../../dtos/channel/response/channel-member.response.dto";

export interface IGetChannelRequestsUseCase {
    execute(payload: {channelId: string}): Promise<ChannelMemberResponseDto[]>;
}
