import { MessageType } from '../enums/MessageType';

export class DirectMessage {
    constructor(
        public conversationId: string,
        public senderId: string,
        public content: string,
        public isSeen: boolean = false,
        public messageType: MessageType = MessageType.TEXT,
        public imageUrl?: string,
        public isEdited: boolean = false,
        public createdAt?: Date,
        public updatedAt?: Date,
        public id?: string
    ) {}
}
