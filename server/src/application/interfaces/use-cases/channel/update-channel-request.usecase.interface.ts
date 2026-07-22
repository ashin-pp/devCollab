import { UpdateChannelRequestDto } from "../../../dtos/channel/request/update-channel-request.dto";

export interface IUpdateChannelRequestUseCase {
    execute(payload: UpdateChannelRequestDto): Promise<{ success: boolean; message: string }>;
}
