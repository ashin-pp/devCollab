import { INotificationRepository } from "../../../application/repositories/INotificationRepository";
import { Notification } from "../../../domain/entities/Notification";
import { NotificationModel, INotificationDocument } from "../models/NotificationModel";
import { MongoBaseRepository } from "./BaseRepository";
import { NotificationMapper } from "../../mappers/NotificationMapper";

export class NotificationRepository extends MongoBaseRepository<Notification, INotificationDocument> implements INotificationRepository {
    constructor() {
        super(NotificationModel, new NotificationMapper());
    }

    async findByUserId(userId: string): Promise<Notification[]> {
        const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
        return docs.map(doc => this._mapper.toDomain(doc));
    }

    async markAsRead(id: string): Promise<Notification | null> {
        const doc = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (!doc) return null;
        return this._mapper.toDomain(doc);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany({ userId }, { isRead: true });
    }
}
