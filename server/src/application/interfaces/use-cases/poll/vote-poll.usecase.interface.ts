import { Poll } from "../../../../domain/entities/poll.entity";

export interface IVotePollUseCase {
    execute(pollId: string, userId: string, optionId: string): Promise<Poll>;
}
