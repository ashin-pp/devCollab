import { NotificationResponseDto } from "../../../dtos/notification/response/notification.response.dto";

export interface IGetUserNotificationsUseCase {
    execute(payload: {userId: string, unreadOnly?: boolean}): Promise<NotificationResponseDto[]>;
}
