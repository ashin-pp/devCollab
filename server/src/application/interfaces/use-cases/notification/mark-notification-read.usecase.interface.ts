import { MarkNotificationReadRequestDto } from "../../../dtos/notification/request/mark-notification-read.dto";

export interface IMarkNotificationReadUseCase {
    execute(payload: MarkNotificationReadRequestDto): Promise<void>;
}
