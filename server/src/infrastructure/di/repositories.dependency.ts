import { container } from 'tsyringe';
import { UserRepository } from '../database/repositories/user.repository';
import { OtpRepository } from '../database/repositories/otp.repository';
import { AdminRepository } from '../database/repositories/admin.repository';
import { WorkspaceRepository } from '../database/repositories/workspace.repository';
import { WorkspaceMemberRepository } from '../database/repositories/workspace-member.repository';
import { ChannelRepository } from '../database/repositories/channel.repository';
import { ChannelMemberRepository } from '../database/repositories/channel-member.repository';
import { MessageRepository } from '../database/repositories/message.repository';
import { ConversationRepository } from '../database/repositories/conversation.repository';
import { DirectMessageRepository } from '../database/repositories/direct-message.repository';
import { PollRepository } from '../database/repositories/poll.repository';
import { NotificationRepository } from '../database/repositories/notification.repository';
import { AITaskRepository } from '../database/repositories/ai-task.repository';
import { AIReminderRepository } from '../database/repositories/ai-reminder.repository';
import { AIChatRepository } from '../database/repositories/ai-chat.repository';
import { PlanRepository } from '../database/repositories/plan.repository';
import { REPOSITORY_TOKENS } from "./repository.tokens";

export function registerRepositories() {
    container.registerSingleton(REPOSITORY_TOKENS.IUserRepository, UserRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IOtpRepository, OtpRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IAdminRepository, AdminRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IWorkspaceRepository, WorkspaceRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IWorkspaceMemberRepository, WorkspaceMemberRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IChannelRepository, ChannelRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IChannelMemberRepository, ChannelMemberRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IMessageRepository, MessageRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IConversationRepository, ConversationRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IDirectMessageRepository, DirectMessageRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IPollRepository, PollRepository);
    container.registerSingleton(REPOSITORY_TOKENS.INotificationRepository, NotificationRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IAITaskRepository, AITaskRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IAIReminderRepository, AIReminderRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IAIChatRepository, AIChatRepository);
    container.registerSingleton(REPOSITORY_TOKENS.IPlanRepository, PlanRepository);
}
