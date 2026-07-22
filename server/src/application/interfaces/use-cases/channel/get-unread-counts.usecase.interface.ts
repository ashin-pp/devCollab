
export interface IGetUnreadCountsUseCase {
    execute(payload: {workspaceId: string, userId: string}): Promise<{ success: boolean; data: Record<string, number>; statusCode: number }>;
}
