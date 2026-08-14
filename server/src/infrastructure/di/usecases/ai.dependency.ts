import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { CreateAIReminderUseCase } from "../../../application/use-cases/ai/create-ai-reminder.usecase";
import { CreateAITaskUseCase } from "../../../application/use-cases/ai/create-ai-task.usecase";
import { CreateAIScheduleUseCase } from "../../../application/use-cases/ai/create-ai-schedule.usecase";
import { JoinAIScheduleVideoUseCase } from "../../../application/use-cases/ai/join-ai-schedule-video.usecase";
import { StartDmVideoCallUseCase } from "../../../application/use-cases/ai/start-dm-video-call.usecase";
import { GetAIDashboardUseCase } from "../../../application/use-cases/ai/get-ai-dashboard.usecase";
import { ClearAIDashboardTabUseCase } from "../../../application/use-cases/ai/clear-ai-dashboard-tab.usecase";
import { UpdateAITaskStatusUseCase } from "../../../application/use-cases/ai/update-ai-task-status.usecase";
import { HandleAiCommandUseCase } from "../../../application/use-cases/ai/handle-ai-command.usecase";
import { SaveAIChatUseCase } from "../../../application/use-cases/ai/save-ai-chat.usecase";

export function registerAiUseCases() {
    container.register(USECASE_TOKENS.ICreateAIReminderUseCase, { useClass: CreateAIReminderUseCase });
    container.register(USECASE_TOKENS.ICreateAITaskUseCase, { useClass: CreateAITaskUseCase });
    container.register(USECASE_TOKENS.ICreateAIScheduleUseCase, { useClass: CreateAIScheduleUseCase });
    container.register(USECASE_TOKENS.IJoinAIScheduleVideoUseCase, { useClass: JoinAIScheduleVideoUseCase });
    container.register(USECASE_TOKENS.IStartDmVideoCallUseCase, { useClass: StartDmVideoCallUseCase });
    container.register(USECASE_TOKENS.IGetAIDashboardUseCase, { useClass: GetAIDashboardUseCase });
    container.register(USECASE_TOKENS.IClearAIDashboardTabUseCase, { useClass: ClearAIDashboardTabUseCase });
    container.register(USECASE_TOKENS.IUpdateAITaskStatusUseCase, { useClass: UpdateAITaskStatusUseCase });
    container.register(USECASE_TOKENS.IHandleAiCommandUseCase, { useClass: HandleAiCommandUseCase });
    container.register(USECASE_TOKENS.ISaveAIChatUseCase, { useClass: SaveAIChatUseCase });
}
