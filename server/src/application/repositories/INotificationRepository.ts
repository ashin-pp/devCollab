import { Notification } from "../../domain/entities/Notification";
import { IBaseRepository } from "./IBaseRepository";

export interface INotificationRepository extends IBaseRepository<Notification> {
    findByUserId(userId: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<void>;
}
