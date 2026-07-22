import { Poll } from "../../../../domain/entities/poll.entity";

export interface IClosePollUseCase {
    execute(pollId: string, userId: string): Promise<Poll>;
}
