import { UpdateChannelDetailsRequestDto } from "../../../dtos/channel/request/update-channel-details-request.dto";
import { ChannelResponseDto } from "../../../dtos/channel/response/channel.response.dto";

export interface IUpdateChannelUseCase {
    execute(payload: UpdateChannelDetailsRequestDto): Promise<ChannelResponseDto>;
}
