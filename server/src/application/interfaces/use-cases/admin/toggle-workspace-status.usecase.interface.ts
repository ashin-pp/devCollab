
export interface IToggleWorkspaceStatusUseCase {
    execute(payload: {workspaceId: string, isActive: boolean}): Promise<void>;
}
