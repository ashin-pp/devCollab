import 'reflect-metadata';
import { container } from 'tsyringe';

// 1. Register all dependencies
import { registerRepositories } from './repositories.dependency';
import { registerServices } from './services.dependency';
import { registerAllUseCases } from './usecases';

registerRepositories();
registerServices();
registerAllUseCases();

// 2. Resolve controllers
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
import { PlanController } from '../../presentation/controllers/plan.controller';

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
export const planController = container.resolve(PlanController);

// 3. Resolve base services
import { WinstonLogger } from '../services/winston-logger.service';
import { JwtService } from '../services/jwt.service';
import { SERVICE_TOKENS } from "./service.tokens";

export const logger = container.resolve<WinstonLogger>(SERVICE_TOKENS.ILogger);
export const jwtService = container.resolve<JwtService>(SERVICE_TOKENS.IJwtService);

export { container };
