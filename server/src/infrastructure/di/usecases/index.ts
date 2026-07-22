import { registerAdminUseCases } from "./admin.dependency";
import { registerAiUseCases } from "./ai.dependency";
import { registerAuthUseCases } from "./auth.dependency";
import { registerChannelUseCases } from "./channel.dependency";
import { registerChatUseCases } from "./chat.dependency";
import { registerDmUseCases } from "./dm.dependency";
import { registerNotificationUseCases } from "./notification.dependency";
import { registerPollUseCases } from "./poll.dependency";
import { registerUserUseCases } from "./user.dependency";
import { registerWorkspaceUseCases } from "./workspace.dependency";

export function registerAllUseCases() {
    registerAdminUseCases();
    registerAiUseCases();
    registerAuthUseCases();
    registerChannelUseCases();
    registerChatUseCases();
    registerDmUseCases();
    registerNotificationUseCases();
    registerPollUseCases();
    registerUserUseCases();
    registerWorkspaceUseCases();
}
