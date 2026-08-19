import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { ClosePollUseCase } from "../../../application/use-cases/poll/close-poll.usecase";
import { CreatePollUseCase } from "../../../application/use-cases/poll/create-poll.usecase";
import { DeletePollUseCase } from "../../../application/use-cases/poll/delete-poll.usecase";
import { GetChannelPollsUseCase } from "../../../application/use-cases/poll/get-channel-polls.usecase";
import { GetWorkspacePollsUseCase } from "../../../application/use-cases/poll/get-workspace-polls.usecase";
import { VotePollUseCase } from "../../../application/use-cases/poll/vote-poll.usecase";

export function registerPollUseCases() {
    container.register(USECASE_TOKENS.IClosePollUseCase, { useClass: ClosePollUseCase });
    container.register(USECASE_TOKENS.ICreatePollUseCase, { useClass: CreatePollUseCase });
    container.register(USECASE_TOKENS.IDeletePollUseCase, { useClass: DeletePollUseCase });
    container.register(USECASE_TOKENS.IGetChannelPollsUseCase, { useClass: GetChannelPollsUseCase });
    container.register(USECASE_TOKENS.IGetWorkspacePollsUseCase, { useClass: GetWorkspacePollsUseCase });
    container.register(USECASE_TOKENS.IVotePollUseCase, { useClass: VotePollUseCase });
}
