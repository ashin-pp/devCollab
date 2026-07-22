import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { CreateAIReminderUseCase } from "../../../application/use-cases/ai/create-ai-reminder.usecase";
import { CreateAITaskUseCase } from "../../../application/use-cases/ai/create-ai-task.usecase";
import { HandleAiCommandUseCase } from "../../../application/use-cases/ai/handle-ai-command.usecase";
import { SaveAIChatUseCase } from "../../../application/use-cases/ai/save-ai-chat.usecase";

export function registerAiUseCases() {
    container.register(USECASE_TOKENS.ICreateAIReminderUseCase, { useClass: CreateAIReminderUseCase });
    container.register(USECASE_TOKENS.ICreateAITaskUseCase, { useClass: CreateAITaskUseCase });
    container.register(USECASE_TOKENS.IHandleAiCommandUseCase, { useClass: HandleAiCommandUseCase });
    container.register(USECASE_TOKENS.ISaveAIChatUseCase, { useClass: SaveAIChatUseCase });
}
