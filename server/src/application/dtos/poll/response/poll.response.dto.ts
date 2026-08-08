export interface PollOptionResponseDto {
    id: string;
    text: string;
    votes: string[];
}

export interface PollResponseDto {
    id: string;
    workspaceId: string;
    question: string;
    options: PollOptionResponseDto[];
    createdBy: string;
    isActive: boolean;
    channelId?: string;
    expiresAt?: Date;
    startsAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
