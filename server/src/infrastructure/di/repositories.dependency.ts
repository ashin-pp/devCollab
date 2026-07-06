import { container } from 'tsyringe';
import { TOKENS } from './tokens';

// Repositories
import { UserRepository } from '../database/repositories/user.repository';
import { OtpRepository } from '../database/repositories/otp.repository';
import { AdminRepository } from '../database/repositories/admin.repository';
import { WorkspaceRepository } from '../database/repositories/workspace.repository';
import { WorkspaceMemberRepository } from '../database/repositories/workspace-member.repository';
import { ChannelRepository } from '../database/repositories/channel.repository';
import { ChannelMemberRepository } from '../database/repositories/channel-member.repository';
import { MessageRepository } from '../database/repositories/message.repository';
import { PollRepository } from '../database/repositories/poll.repository';
import { NotificationRepository } from '../database/repositories/notification.repository';
import { ConversationRepository } from '../database/repositories/conversation.repository';
import { DirectMessageRepository } from '../database/repositories/direct-message.repository';
import { AITaskRepository } from '../database/repositories/ai-task.repository';
import { AIReminderRepository } from '../database/repositories/ai-reminder.repository';
import { AIChatRepository } from '../database/repositories/ai-chat.repository';

export function registerRepositories() {
    container.registerSingleton(TOKENS.IUserRepository, UserRepository);
    container.registerSingleton(TOKENS.IOtpRepository, OtpRepository);
    container.registerSingleton(TOKENS.IAdminRepository, AdminRepository);
    container.registerSingleton(TOKENS.IWorkspaceRepository, WorkspaceRepository);
    container.registerSingleton(TOKENS.IWorkspaceMemberRepository, WorkspaceMemberRepository);
    container.registerSingleton(TOKENS.IChannelRepository, ChannelRepository);
    container.registerSingleton(TOKENS.IChannelMemberRepository, ChannelMemberRepository);
    container.registerSingleton(TOKENS.IMessageRepository, MessageRepository);
    container.registerSingleton(TOKENS.IPollRepository, PollRepository);
    container.registerSingleton(TOKENS.INotificationRepository, NotificationRepository);
    container.registerSingleton(TOKENS.IConversationRepository, ConversationRepository);
    container.registerSingleton(TOKENS.IDirectMessageRepository, DirectMessageRepository);
    container.registerSingleton(TOKENS.IAITaskRepository, AITaskRepository);
    container.registerSingleton(TOKENS.IAIReminderRepository, AIReminderRepository);
    container.registerSingleton(TOKENS.IAIChatRepository, AIChatRepository);
}
