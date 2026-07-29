import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { GetConversationsUseCase } from "../../../application/use-cases/dm/get-conversations.usecase";
import { GetDirectMessagesUseCase } from "../../../application/use-cases/dm/get-direct-messages.usecase";
import { MarkMessageAsSeenUseCase } from "../../../application/use-cases/dm/mark-message-as-seen.usecase";
import { SendDirectMessageUseCase } from "../../../application/use-cases/dm/send-direct-message.usecase";
import { StartConversationUseCase } from "../../../application/use-cases/dm/start-conversation.usecase";

export function registerDmUseCases() {
    container.register(USECASE_TOKENS.IGetConversationsUseCase, { useClass: GetConversationsUseCase });
    container.register(USECASE_TOKENS.IGetDirectMessagesUseCase, { useClass: GetDirectMessagesUseCase });
    container.register(USECASE_TOKENS.IMarkMessageAsSeenUseCase, { useClass: MarkMessageAsSeenUseCase });
    container.register(USECASE_TOKENS.ISendDirectMessageUseCase, { useClass: SendDirectMessageUseCase });
    container.register(USECASE_TOKENS.IStartConversationUseCase, { useClass: StartConversationUseCase });
}
