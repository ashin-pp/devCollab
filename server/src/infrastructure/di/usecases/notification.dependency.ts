import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { ClearUserNotificationsUseCase } from "../../../application/use-cases/notification/clear-user-notifications.usecase";
import { CreateNotificationUseCase } from "../../../application/use-cases/notification/create-notification.usecase";
import { GetUserNotificationsUseCase } from "../../../application/use-cases/notification/get-user-notifications.usecase";
import { MarkNotificationReadUseCase } from "../../../application/use-cases/notification/mark-notification-read.usecase";

export function registerNotificationUseCases() {
    container.register(USECASE_TOKENS.IClearUserNotificationsUseCase, { useClass: ClearUserNotificationsUseCase });
    container.register(USECASE_TOKENS.ICreateNotificationUseCase, { useClass: CreateNotificationUseCase });
    container.register(USECASE_TOKENS.IGetUserNotificationsUseCase, { useClass: GetUserNotificationsUseCase });
    container.register(USECASE_TOKENS.IMarkNotificationReadUseCase, { useClass: MarkNotificationReadUseCase });
}
