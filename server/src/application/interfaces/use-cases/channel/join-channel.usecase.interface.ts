import { JoinChannelRequestDto } from "../../../dtos/channel/request/join-channel-request.dto";

export interface IJoinChannelUseCase {
    execute(payload: JoinChannelRequestDto): Promise<{ success: boolean; status: string; message: string; userName?: string }>;
}
