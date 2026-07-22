import { Poll } from "../../../../domain/entities/poll.entity";

export interface ICreatePollUseCase {
    execute(data: {
            workspaceId: string;
            question: string;
            options: string[];
            createdBy: string;
            channelId?: string;
            expiresAt?: Date;
            startsAt?: Date;
        }): Promise<Poll>;
}
