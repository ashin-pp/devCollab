import 'reflect-metadata';
import { container } from 'tsyringe';
import { registerDependencies } from './dependency-registration';

import { AuthController } from '../../presentation/controllers/auth.controller';
import { AdminController } from '../../presentation/controllers/admin.controller';
import { UserController } from '../../presentation/controllers/user.controller';
import { WorkspaceController } from '../../presentation/controllers/workspace.controller';
import { ChannelController } from '../../presentation/controllers/channel.controller';
import { MessageController } from '../../presentation/controllers/message.controller';
import { DMController } from '../../presentation/controllers/dm.controller';
import { PollController } from '../../presentation/controllers/poll.controller';
import { UploadController } from '../../presentation/controllers/upload.controller';
import { NotificationController } from '../../presentation/controllers/notification.controller';
import { AIController } from '../../presentation/controllers/ai.controller';

// Initialize container
registerDependencies();

export const authController = container.resolve(AuthController);
export const adminController = container.resolve(AdminController);
export const userController = container.resolve(UserController);
export const workspaceController = container.resolve(WorkspaceController);
export const channelController = container.resolve(ChannelController);
export const messageController = container.resolve(MessageController);
export const dmController = container.resolve(DMController);
export const pollController = container.resolve(PollController);
export const uploadController = container.resolve(UploadController);
export const notificationController = container.resolve(NotificationController);
export const aiController = container.resolve(AIController);

import { TOKENS } from './tokens';
import { WinstonLogger } from '../services/winston-logger.service';
import { JwtService } from '../services/jwt.service';

export const logger = container.resolve<WinstonLogger>(TOKENS.ILogger);
export const jwtService = container.resolve<JwtService>(TOKENS.IJwtService);
