import { injectable } from 'tsyringe';
import { INotificationRepository } from "../../../application/interfaces/repositories/notification.repository.interface";
import { Notification } from "../../../domain/entities/notification.entity";
import { NotificationModel, INotificationDocument } from "../models/notification.model";
import { MongoBaseRepository } from "./base.repository";
import { NotificationMapper } from "../mappers/notification.mapper";

@injectable()
export class NotificationRepository extends MongoBaseRepository<Notification, INotificationDocument> implements INotificationRepository {
    constructor() {
        super(NotificationModel, new NotificationMapper());
    }

    async findByUserId(userId: string): Promise<Notification[]> {
        const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
        return docs.map(doc => this._mapper.toDomain(doc));
    }

    async findAiNotifiesForUserInWorkspace(
        userId: string,
        workspaceId: string,
        limit = 50
    ): Promise<Notification[]> {
        const docs = await NotificationModel.find({
            userId,
            type: 'AI_NOTIFY',
            relatedId: workspaceId,
        })
            .sort({ createdAt: -1 })
            .limit(limit);
        return docs.map((doc) => this._mapper.toDomain(doc));
    }

    async clearAiNotifiesForUserInWorkspace(userId: string, workspaceId: string): Promise<number> {
        const result = await NotificationModel.deleteMany({
            userId,
            type: 'AI_NOTIFY',
            relatedId: workspaceId,
        });
        return result.deletedCount ?? 0;
    }

    async markAsRead(id: string): Promise<Notification | null> {
        const doc = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (!doc) return null;
        return this._mapper.toDomain(doc);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany({ userId }, { isRead: true });
    }

    async deleteAll(userId: string): Promise<void> {
        await NotificationModel.deleteMany({ userId });
    }
}
