export interface JoinWorkspaceRequestDto {
    inviteCode: string;
    userId: string;
    isFromEmailLink?: boolean;
}
