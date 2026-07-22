import { Message } from "../../../../domain/entities/message.entity";
import { SendMessageRequestDto } from "../../../dtos/channel/request/send-message-request.dto";

export interface ISendMessageUseCase {
    execute(payload: SendMessageRequestDto): Promise<Message>;
}
