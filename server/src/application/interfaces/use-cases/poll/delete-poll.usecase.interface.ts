import { Poll } from "../../../../domain/entities/poll.entity";

export interface IDeletePollUseCase {
    execute(pollId: string, userId: string): Promise<Poll>;
}
