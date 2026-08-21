import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { envConfig } from "../../config/envConfig";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { JwtService } from "../services/jwt.service";
import { logger } from "../../infrastructure/di/container";
import { Message } from "../../domain/entities/message.entity";
import { DirectMessage } from "../../domain/entities/direct-message.entity";

interface AuthenticatedSocket extends Socket {
    user?: {
        id: string;
        [key: string]: unknown;
    };
}

export class SocketService {
    private static _instance: SocketService;
    private _io: SocketIOServer;
    private _jwtService = new JwtService();

    constructor(httpServer: HttpServer) {
        this._io = new SocketIOServer(httpServer, {
            cors: {
                origin: envConfig.allowedOrigins,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
            }
        });
        SocketService._instance = this;
    }

    public static getInstance(): SocketService | null {
        return SocketService._instance || null;
    }

    public initialize(): void {
        this._io.use((socket, next) => {
            try {
                const cookieStr = socket.handshake.headers.cookie || '';
                const cookies = Object.fromEntries(
                    cookieStr.split('; ').map(c => c.split('='))
                );
                const token = cookies.access_token || socket.handshake.auth.token;

                if (!token) {
                    return next(new Error(ErrorMessage.SOCKET_AUTH_ERROR));
                }

                const decoded = this._jwtService.verifyAccessToken(token);
                if (decoded && typeof decoded !== 'string' && 'id' in decoded) {
                    (socket as AuthenticatedSocket).user = decoded as { id: string;[key: string]: unknown };
                    next();
                } else {
                    next(new Error(ErrorMessage.SOCKET_AUTH_ERROR));
                }
            } catch (_err) {
                next(new Error(ErrorMessage.SOCKET_AUTH_ERROR));
            }
        });

        this._io.on('connection', (socket: Socket) => {
            const authSocket = socket as AuthenticatedSocket;
            const user = authSocket.user;

            if (!user) {
                logger.error('Socket connected without user payload');
                return;
            }

            logger.info(`User connected to socket: ${user.id}`);

            socket.on('join_workspace', (workspaceId: string) => {
                socket.join(`workspace:${workspaceId}`);
            });

            socket.join(`user:${user.id}`);

            socket.on('join_channel', (channelId: string) => {
                logger.info(`User ${user.id} joining channel: ${channelId}`);
                socket.join(`channel:${channelId}`);
            });

            socket.on('leave_channel', (channelId: string) => {
                socket.leave(`channel:${channelId}`);
            });

            socket.on('typing', (data: { channelId: string, userName: string }) => {
                logger.info(`User ${user.id} (${data.userName}) typing in channel ${data.channelId}`);
                socket.to(`channel:${data.channelId}`).emit('user_typing', {
                    channelId: data.channelId,
                    userId: user.id,
                    userName: data.userName
                });
            });

            socket.on('stop_typing', (data: { channelId: string, userName: string }) => {
                logger.info(`User ${user.id} (${data.userName}) stopped typing in channel ${data.channelId}`);
                socket.to(`channel:${data.channelId}`).emit('user_stopped_typing', {
                    channelId: data.channelId,
                    userId: user.id,
                    userName: data.userName
                });
            });

            socket.on('new_message', (message: Message) => {
                logger.info(`Received new_message for channel ${message.channelId} from user ${user.id}`);

                if (message.threadRootId) {
                    if (message.replyVisibility === 'author') {
                        const recipients = new Set<string>([message.senderId]);
                        if (message.visibleToUserId) {
                            recipients.add(message.visibleToUserId);
                        }
                        for (const recipientId of recipients) {
                            this._io.to(`user:${recipientId}`).emit('thread_reply_received', message);
                        }
                    } else {
                        this._io.to(`channel:${message.channelId}`).emit('thread_reply_received', message);
                    }
                    return;
                }

                this._io.to(`channel:${message.channelId}`).emit('message_received', message);
            });

            socket.on('join_conversation', (conversationId: string) => {
                logger.info(`User ${user.id} joining conversation: ${conversationId}`);
                socket.join(`conversation:${conversationId}`);
            });

            socket.on('leave_conversation', (conversationId: string) => {
                socket.leave(`conversation:${conversationId}`);
            });

            socket.on('dm_typing', (data: { conversationId: string, userName: string }) => {
                socket.to(`conversation:${data.conversationId}`).emit('user_dm_typing', {
                    conversationId: data.conversationId,
                    userId: user.id,
                    userName: data.userName
                });
            });

            socket.on('dm_stop_typing', (data: { conversationId: string, userName: string }) => {
                socket.to(`conversation:${data.conversationId}`).emit('user_dm_stopped_typing', {
                    conversationId: data.conversationId,
                    userId: user.id,
                    userName: data.userName
                });
            });

            socket.on('new_dm', (message: DirectMessage) => {
                logger.info(`Received new_dm for conversation ${message.conversationId} from user ${user.id}`);
                this._io.to(`conversation:${message.conversationId}`).emit('dm_received', message);
            });

            socket.on('dm_seen', (data: { conversationId: string, userId: string }) => {
                socket.to(`conversation:${data.conversationId}`).emit('dm_messages_seen', {
                    conversationId: data.conversationId,
                    userId: user.id
                });
            });

            socket.on('webrtc_join', async (data: { scheduleId: string }) => {
                const scheduleId = String(data?.scheduleId || '');
                if (!scheduleId) return;

                const room = `call:${scheduleId}`;
                await socket.join(room);

                const socketsInRoom = await this._io.in(room).fetchSockets();
                const peers = socketsInRoom
                    .filter((s) => s.id !== socket.id)
                    .map((s) => {
                        const peerUser = (s as unknown as AuthenticatedSocket).user;
                        return {
                            socketId: s.id,
                            userId: peerUser?.id ?? '',
                        };
                    });

                socket.emit('webrtc_existing_peers', { scheduleId, peers });
                socket.to(room).emit('webrtc_peer_joined', {
                    scheduleId,
                    socketId: socket.id,
                    userId: user.id,
                });
            });

            socket.on('webrtc_leave', (data: { scheduleId: string }) => {
                const scheduleId = String(data?.scheduleId || '');
                if (!scheduleId) return;
                const room = `call:${scheduleId}`;
                socket.to(room).emit('webrtc_peer_left', {
                    scheduleId,
                    socketId: socket.id,
                    userId: user.id,
                });
                void socket.leave(room);
            });

            socket.on(
                'webrtc_offer',
                (data: { toSocketId: string; sdp: unknown }) => {
                    if (!data?.toSocketId || !data.sdp) return;
                    this._io.to(data.toSocketId).emit('webrtc_offer', {
                        fromSocketId: socket.id,
                        fromUserId: user.id,
                        sdp: data.sdp,
                    });
                }
            );

            socket.on(
                'webrtc_answer',
                (data: { toSocketId: string; sdp: unknown }) => {
                    if (!data?.toSocketId || !data.sdp) return;
                    this._io.to(data.toSocketId).emit('webrtc_answer', {
                        fromSocketId: socket.id,
                        fromUserId: user.id,
                        sdp: data.sdp,
                    });
                }
            );

            socket.on(
                'webrtc_ice',
                (data: { toSocketId: string; candidate: unknown }) => {
                    if (!data?.toSocketId || !data.candidate) return;
                    this._io.to(data.toSocketId).emit('webrtc_ice', {
                        fromSocketId: socket.id,
                        fromUserId: user.id,
                        candidate: data.candidate,
                    });
                }
            );

            socket.on('disconnect', () => {
                logger.info(`User disconnected: ${user.id}`);
                for (const room of socket.rooms) {
                    if (room.startsWith('call:')) {
                        const scheduleId = room.slice('call:'.length);
                        socket.to(room).emit('webrtc_peer_left', {
                            scheduleId,
                            socketId: socket.id,
                            userId: user.id,
                        });
                    }
                }
            });
        });
    }

    public getIO(): SocketIOServer {
        return this._io;
    }
}
