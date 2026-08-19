import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { UploadChatImageUseCase } from "../../../application/use-cases/chat/upload-chat-image.usecase";

export function registerChatUseCases() {
    container.register(USECASE_TOKENS.IUploadChatImageUseCase, { useClass: UploadChatImageUseCase });
}
