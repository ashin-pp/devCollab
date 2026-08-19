export interface IClaimPendingWorkspaceInvitesUseCase {
    execute(payload: { userId: string; email: string }): Promise<void>;
}
