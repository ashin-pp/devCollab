import { Notification } from "../../../../domain/entities/notification.entity";
import { CreateNotificationRequestDto } from "../../../dtos/notification/request/create-notification.dto";

export interface ICreateNotificationUseCase {
    execute(payload: CreateNotificationRequestDto): Promise<Notification>;
}
