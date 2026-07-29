
export interface ISendWorkspaceInviteUseCase {
    execute(payload: {workspaceId: string, requesterId: string, targetEmail: string}): Promise<{ success: boolean; message: string }>;
}
