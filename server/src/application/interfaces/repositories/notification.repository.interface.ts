import { Notification } from "../../../domain/entities/notification.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface INotificationRepository extends IBaseRepository<Notification> {
    findByUserId(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
    findAiNotifiesForUserInWorkspace(userId: string, workspaceId: string, limit?: number): Promise<Notification[]>;
    clearAiNotifiesForUserInWorkspace(userId: string, workspaceId: string): Promise<number>;
    markAsRead(id: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<void>;
    deleteAll(userId: string): Promise<void>;
}
