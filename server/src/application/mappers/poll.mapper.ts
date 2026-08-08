import { Poll } from "../../domain/entities/poll.entity";
import { PollResponseDto } from "../dtos/poll/response/poll.response.dto";

export function toPollResponseDto(poll: Poll): PollResponseDto {
    return {
        id: poll.id as string,
        workspaceId: poll.workspaceId,
        question: poll.question,
        options: poll.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            votes: opt.votes,
        })),
        createdBy: poll.createdBy,
        isActive: poll.isActive,
        channelId: poll.channelId,
        expiresAt: poll.expiresAt,
        startsAt: poll.startsAt,
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt,
    };
}
