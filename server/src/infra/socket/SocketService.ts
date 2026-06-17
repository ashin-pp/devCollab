import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { envConfig } from '../config/envConfig';
import { JwtService } from '../services/JwtService';
import { logger } from '../../container';

export class SocketService {
    private static instance: SocketService;
    private io: SocketIOServer;
    private jwtService = new JwtService();

    constructor(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: envConfig.clientUrl,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
            }
        });
        SocketService.instance = this;
    }

    public static getInstance(): SocketService | null {
        return SocketService.instance || null;
    }

    public initialize(): void {
        this.io.use((socket, next) => {
            try {
                const cookieStr = socket.handshake.headers.cookie || '';
                const cookies = Object.fromEntries(
                    cookieStr.split('; ').map(c => c.split('='))
                );
                const token = cookies.access_token || socket.handshake.auth.token;

                if (!token) {
                    return next(new Error('Authentication error'));
                }

                const decoded = this.jwtService.verifyAccessToken(token);
                if (decoded && decoded.id) {
                    (socket as any).user = decoded;
                    next();
                } else {
                    next(new Error('Authentication error'));
                }
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket: Socket) => {
            const user = (socket as any).user;
            logger.info(`User connected to socket: ${user.id}`);

            socket.on('join_workspace', (workspaceId: string) => {
                socket.join(`workspace:${workspaceId}`);
            });

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

            socket.on('new_message', (message: any) => {
                logger.info(`Received new_message for channel ${message.channelId} from user ${user.id}`);
                this.io.to(`channel:${message.channelId}`).emit('message_received', message);
            });

            socket.on('disconnect', () => {
                logger.info(`User disconnected: ${user.id}`);
            });
        });
    }

    public getIO(): SocketIOServer {
        return this.io;
    }
}
