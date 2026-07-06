import { Notification } from "../../../domain/entities/notification.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface INotificationRepository extends IBaseRepository<Notification> {
    findByUserId(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<void>;
    deleteAll(userId: string): Promise<void>;
}
