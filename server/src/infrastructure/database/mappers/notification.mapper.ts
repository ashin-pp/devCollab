import { Notification } from "../../../domain/entities/notification.entity";
import { INotificationDocument } from "../models/notification.model";
import { IMapper } from "../../../application/interfaces/IMapper";
import { Types } from "mongoose";

export class NotificationMapper implements IMapper<Notification, INotificationDocument> {
    toDomain(doc: INotificationDocument): Notification {
        return {
            id: doc._id.toString(),
            userId: doc.userId.toString(),
            type: doc.type as 'POLL_CREATED' | 'JOIN_REQUEST_APPROVED' | 'WORKSPACE_INVITE' | 'GENERAL',
            title: doc.title,
            message: doc.message,
            relatedId: doc.relatedId,
            isRead: doc.isRead,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }

    toPersistence(domain: Partial<Notification>): Partial<INotificationDocument> {
        return {
            ...(domain.userId && { userId: new Types.ObjectId(domain.userId) as any }),
            ...(domain.type && { type: domain.type }),
            ...(domain.title && { title: domain.title }),
            ...(domain.message && { message: domain.message }),
            ...(domain.relatedId !== undefined && { relatedId: domain.relatedId }),
            ...(domain.isRead !== undefined && { isRead: domain.isRead }),
        };
    }
}
