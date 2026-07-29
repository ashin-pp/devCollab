
export interface IDeleteWorkspaceUseCase {
    execute(payload: {workspaceId: string, ownerId: string}): Promise<void>;
}
