import { CreateChannelRequestDto } from "../../../dtos/channel/request/create-channel-request.dto";
import { ChannelResponseDto } from "../../../dtos/channel/response/channel.response.dto";

export interface ICreateChannelUseCase {
    execute(payload: CreateChannelRequestDto): Promise<ChannelResponseDto>;
}
