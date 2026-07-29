
export interface IClearUserNotificationsUseCase {
    execute(payload: { userId: string }): Promise<void>;
}
