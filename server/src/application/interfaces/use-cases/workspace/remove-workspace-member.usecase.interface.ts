
export interface IRemoveWorkspaceMemberUseCase {
    execute(payload: {workspaceId: string, requesterId: string, targetUserId: string}): Promise<void>;
}
