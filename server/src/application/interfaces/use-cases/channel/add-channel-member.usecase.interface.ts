import { AddChannelMemberRequestDto } from "../../../dtos/channel/request/add-channel-member-request.dto";
import { ChannelMemberResponseDto } from "../../../dtos/channel/response/channel-member.response.dto";

export interface IAddChannelMemberUseCase {
    execute(payload: AddChannelMemberRequestDto): Promise<ChannelMemberResponseDto[]>;
}
