import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { envConfig } from '../config/envConfig';
import { JwtService } from '../services/JwtService';
import { logger } from '../../container';
import { Message } from '../../domain/entities/Message';
import { DirectMessage } from '../../domain/entities/DirectMessage';

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
                origin: envConfig.clientUrl,
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
                    return next(new Error('Authentication error'));
                }

                const decoded = this._jwtService.verifyAccessToken(token);
                if (decoded && typeof decoded !== 'string' && 'id' in decoded) {
                    (socket as AuthenticatedSocket).user = decoded as { id: string;[key: string]: unknown };
                    next();
                } else {
                    next(new Error('Authentication error'));
                }
            } catch (err) {
                next(new Error('Authentication error'));
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

            // Join personal room for user-specific notifications
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
                this._io.to(`channel:${message.channelId}`).emit('message_received', message);
            });

            // --- DM Socket Events ---
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

            socket.on('disconnect', () => {
                logger.info(`User disconnected: ${user.id}`);
            });
        });
    }

    public getIO(): SocketIOServer {
        return this._io;
    }
}
