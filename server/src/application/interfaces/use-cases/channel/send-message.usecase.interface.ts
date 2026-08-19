import { SendMessageRequestDto } from "../../../dtos/channel/request/send-message-request.dto";
import { MessageResponseDto } from "../../../dtos/channel/response/message.response.dto";

export interface ISendMessageUseCase {
    execute(payload: SendMessageRequestDto): Promise<MessageResponseDto>;
}
