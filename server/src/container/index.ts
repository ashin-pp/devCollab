// --- Base Services & Models ---
import { WinstonLogger } from "../infra/services/WinstonLogger";
import { UserModel } from "../infra/database/models/UserModel";
import { UserRepository } from "../infra/database/repositories/UserRepository";
import { BcryptHashService } from "../infra/services/BcryptHashService";
import { OtpModel } from "../infra/database/models/OtpModel";
import { OtpRepository } from "../infra/database/repositories/OtpRepository";
import { NodemailerEmailService } from "../infra/services/NodemailerEmailService";
import { JwtService } from "../infra/services/JwtService";
import { CloudinaryStorageService } from "../infra/services/CloudinaryStorageService";

// --- Auth Imports ---
import { RegisterUserUseCase } from "../application/use-cases/auth/RegisterUserUseCase";
import { AuthController } from "../interfaces/controllers/AuthController";
import { SendOtpUseCase } from "../application/use-cases/auth/SendOtpUseCase";
import { VerifyOtpUseCase } from "../application/use-cases/auth/VerifyOtpUseCase";
import { LoginUserUseCase } from "../application/use-cases/auth/LoginUserUseCase";
import { GoogleAuthUseCase } from "../application/use-cases/auth/GoogleAuthUseCase";
import { ForgotPasswordUseCase } from "../application/use-cases/auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../application/use-cases/auth/ResetPasswordUseCase";
import { RefreshTokenUseCase } from "../application/use-cases/auth/RefreshTokenUseCase";
import { VerifyResetOtpUseCase } from "../application/use-cases/auth/VerifyResetOtpUseCase";

// --- Admin Imports ---
import { AdminModel } from "../infra/database/models/AdminModel";
import { AdminRepository } from "../infra/database/repositories/AdminRepository";
import { CreateAdminUseCase } from "../application/use-cases/admin/CreateAdminUseCase";
import { AdminLoginUseCase } from "../application/use-cases/admin/AdminLoginUseCase";
import { AdminForgotPasswordUseCase } from "../application/use-cases/admin/AdminForgotPasswordUseCase";
import { AdminResetPasswordUseCase } from "../application/use-cases/admin/AdminResetPasswordUseCase";
import { GetAllUsersUseCase } from "../application/use-cases/admin/GetAllUsersUseCase";
import { ToggleUserStatusUseCase } from "../application/use-cases/admin/ToggleUserStatusUseCase";
import { AdminRefreshTokenUseCase } from "../application/use-cases/admin/AdminRefreshTokenUseCase";
import { AdminController } from "../interfaces/controllers/AdminController";

// --- User Imports ---
import { GetUserProfileUseCase } from "../application/use-cases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "../application/use-cases/user/UpdateUserProfileUseCase";
import { ChangePasswordUseCase } from "../application/use-cases/user/ChangePasswordUseCase";
import { RequestEmailChangeUseCase } from "../application/use-cases/user/RequestEmailChangeUseCase";
import { VerifyEmailChangeUseCase } from "../application/use-cases/user/VerifyEmailChangeUseCase";
import { UploadProfileImageUseCase } from "../application/use-cases/user/UploadProfileImageUseCase";
import { UploadChatImageUseCase } from "../application/use-cases/chat/UploadChatImageUseCase";
import { UploadController } from "../interfaces/controllers/UploadController";
import { DeleteProfileImageUseCase } from "../application/use-cases/user/DeleteProfileImageUseCase";
import { SearchUserByEmailUseCase } from "../application/use-cases/user/SearchUserByEmailUseCase";
import { UserController } from "../interfaces/controllers/UserController";

// --- Workspace Imports ---
import { WorkspaceModel } from "../infra/database/models/WorkspaceModel";
import { WorkspaceMemberModel } from "../infra/database/models/WorkspaceMemberModel";
import { WorkspaceRepository } from "../infra/database/repositories/WorkspaceRepository";
import { WorkspaceMemberRepository } from "../infra/database/repositories/WorkspaceMemberRepository";
import { CreateWorkspaceUseCase } from "../application/use-cases/workspace/CreateWorkspaceUseCase";
import { JoinWorkspaceUseCase } from "../application/use-cases/workspace/JoinWorkspaceUseCase";
import { GetUserWorkspacesUseCase } from "../application/use-cases/workspace/GetUserWorkspacesUseCase";
import { GetPublicWorkspacesUseCase } from "../application/use-cases/workspace/GetPublicWorkspacesUseCase";
import { VerifyInviteCodeUseCase } from "../application/use-cases/workspace/VerifyInviteCodeUseCase";
import { GetWorkspaceMembersUseCase } from "../application/use-cases/workspace/GetWorkspaceMembersUseCase";
import { HandleJoinRequestUseCase } from "../application/use-cases/workspace/HandleJoinRequestUseCase";
import { RemoveWorkspaceMemberUseCase } from "../application/use-cases/workspace/RemoveWorkspaceMemberUseCase";
import { BlockWorkspaceMemberUseCase } from "../application/use-cases/workspace/BlockWorkspaceMemberUseCase";
import { UnblockWorkspaceMemberUseCase } from "../application/use-cases/workspace/UnblockWorkspaceMemberUseCase";
import { UpdateWorkspaceUseCase } from "../application/use-cases/workspace/UpdateWorkspaceUseCase";
import { RegenerateInviteCodeUseCase } from "../application/use-cases/workspace/RegenerateInviteCodeUseCase";
import { DeleteWorkspaceUseCase } from "../application/use-cases/workspace/DeleteWorkspaceUseCase";
import { SendWorkspaceInviteUseCase } from "../application/use-cases/workspace/SendWorkspaceInviteUseCase";
import { WorkspaceController } from "../interfaces/controllers/WorkspaceController";

// Admin workspace use cases
import { GetAllWorkspacesUseCase } from "../application/use-cases/workspace/GetAllWorkspacesUseCase";
import { AdminToggleWorkspaceStatusUseCase } from "../application/use-cases/workspace/AdminToggleWorkspaceStatusUseCase";
import { AdminGetWorkspaceMembersUseCase } from "../application/use-cases/workspace/AdminGetWorkspaceMembersUseCase";
import { AdminUpdateWorkspaceMemberStatusUseCase } from "../application/use-cases/workspace/AdminUpdateWorkspaceMemberStatusUseCase";

// --- Channel & Message Imports ---
import { ChannelRepository } from "../infra/database/repositories/ChannelRepository";
import { ChannelMemberRepository } from "../infra/database/repositories/ChannelMemberRepository";
import { MessageRepository } from "../infra/database/repositories/MessageRepository";
import { CreateChannelUseCase } from "../application/use-cases/channel/CreateChannelUseCase";
import { GetWorkspaceChannelsUseCase } from "../application/use-cases/channel/GetWorkspaceChannelsUseCase";
import { GetChannelMembersUseCase } from "../application/use-cases/channel/GetChannelMembersUseCase";
import { AddChannelMemberUseCase } from "../application/use-cases/channel/AddChannelMemberUseCase";
import { RemoveChannelMemberUseCase } from '../application/use-cases/channel/RemoveChannelMemberUseCase';
import { BlockChannelMemberUseCase } from '../application/use-cases/channel/BlockChannelMemberUseCase';
import { GetBlockedChannelMembersUseCase } from '../application/use-cases/channel/GetBlockedChannelMembersUseCase';
import { UnblockChannelMemberUseCase } from '../application/use-cases/channel/UnblockChannelMemberUseCase';
import { UpdateChannelUseCase } from '../application/use-cases/channel/UpdateChannelUseCase';
import { LeaveChannelUseCase } from "../application/use-cases/channel/LeaveChannelUseCase";
import { DeleteChannelUseCase } from "../application/use-cases/channel/DeleteChannelUseCase";
import { JoinChannelUseCase } from "../application/use-cases/channel/JoinChannelUseCase";
import { GetChannelRequestsUseCase } from "../application/use-cases/channel/GetChannelRequestsUseCase";
import { UpdateChannelRequestUseCase } from "../application/use-cases/channel/UpdateChannelRequestUseCase";
import { MarkChannelAsReadUseCase } from "../application/use-cases/channel/MarkChannelAsReadUseCase";
import { GetUnreadCountsUseCase } from "../application/use-cases/channel/GetUnreadCountsUseCase";
import { SendMessageUseCase } from "../application/use-cases/channel/SendMessageUseCase";
import { GetChannelMessagesUseCase } from "../application/use-cases/channel/GetChannelMessagesUseCase";
import { ChannelController } from "../interfaces/controllers/ChannelController";
import { MessageController } from "../interfaces/controllers/MessageController";

// --- Poll Imports ---
import { PollRepository } from "../infra/database/repositories/PollRepository";
import { CreatePollUseCase } from "../application/use-cases/poll/CreatePollUseCase";
import { VotePollUseCase } from "../application/use-cases/poll/VotePollUseCase";
import { GetWorkspacePollsUseCase } from "../application/use-cases/poll/GetWorkspacePollsUseCase";
import { GetChannelPollsUseCase } from "../application/use-cases/poll/GetChannelPollsUseCase";
import { DeletePollUseCase } from "../application/use-cases/poll/DeletePollUseCase";
import { ClosePollUseCase } from "../application/use-cases/poll/ClosePollUseCase";
import { PollController } from "../interfaces/controllers/PollController";

// ============================================================================
// INSTANTIATIONS
// ============================================================================

const logger = new WinstonLogger();
const hashService = new BcryptHashService();
const emailService = new NodemailerEmailService();
const jwtService = new JwtService();
const cloudinaryStorageService = new CloudinaryStorageService();

const userRepository = new UserRepository(UserModel);
const otpRepository = new OtpRepository(OtpModel);
const adminRepository = new AdminRepository(AdminModel);
const workspaceRepository = new WorkspaceRepository();
const workspaceMemberRepository = new WorkspaceMemberRepository();

const registerUserUseCase = new RegisterUserUseCase(userRepository, hashService);
const sendOtpUseCase = new SendOtpUseCase(otpRepository, emailService);
const verifyOtpUseCase = new VerifyOtpUseCase(otpRepository, userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, hashService, jwtService);
const googleAuthUseCase = new GoogleAuthUseCase(userRepository, jwtService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, sendOtpUseCase);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, otpRepository, hashService);
const refreshTokenUseCase = new RefreshTokenUseCase(jwtService, userRepository);
const verifyResetOtpUseCase = new VerifyResetOtpUseCase(otpRepository);

const authController = new AuthController(
    registerUserUseCase,
    sendOtpUseCase,
    verifyOtpUseCase,
    loginUserUseCase,
    googleAuthUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    refreshTokenUseCase,
    verifyResetOtpUseCase
);

// Admin Use Cases
const createAdminUseCase = new CreateAdminUseCase(adminRepository, hashService);
const adminLoginUseCase = new AdminLoginUseCase(adminRepository, hashService, jwtService);
const adminForgotPasswordUseCase = new AdminForgotPasswordUseCase(adminRepository, sendOtpUseCase, otpRepository);
const adminResetPasswordUseCase = new AdminResetPasswordUseCase(adminRepository, otpRepository, hashService);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const toggleUserStatusUseCase = new ToggleUserStatusUseCase(userRepository);
const adminRefreshTokenUseCase = new AdminRefreshTokenUseCase(jwtService, adminRepository);

// Workspace Use Cases (Admin)
const getAllWorkspacesUseCase = new GetAllWorkspacesUseCase(workspaceRepository, workspaceMemberRepository, userRepository);
const adminToggleWorkspaceStatusUseCase = new AdminToggleWorkspaceStatusUseCase(workspaceRepository);
const adminGetWorkspaceMembersUseCase = new AdminGetWorkspaceMembersUseCase(workspaceMemberRepository, userRepository);
const adminUpdateWorkspaceMemberStatusUseCase = new AdminUpdateWorkspaceMemberStatusUseCase(workspaceMemberRepository);

const adminController = new AdminController(
    createAdminUseCase,
    adminLoginUseCase,
    adminForgotPasswordUseCase,
    adminResetPasswordUseCase,
    getAllUsersUseCase,
    toggleUserStatusUseCase,
    verifyResetOtpUseCase,
    adminRefreshTokenUseCase,
    getAllWorkspacesUseCase,
    adminToggleWorkspaceStatusUseCase,
    adminGetWorkspaceMembersUseCase,
    adminUpdateWorkspaceMemberStatusUseCase
);

// User Use Cases
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository, hashService);
const requestEmailChangeUseCase = new RequestEmailChangeUseCase(userRepository, otpRepository, emailService);
const verifyEmailChangeUseCase = new VerifyEmailChangeUseCase(userRepository, otpRepository);
const uploadProfileImageUseCase = new UploadProfileImageUseCase(userRepository, cloudinaryStorageService);
const uploadChatImageUseCase = new UploadChatImageUseCase(cloudinaryStorageService);
const deleteProfileImageUseCase = new DeleteProfileImageUseCase(userRepository, cloudinaryStorageService);
const searchUsersByEmailUseCase = new SearchUserByEmailUseCase(userRepository);

const userController = new UserController(
    getUserProfileUseCase,
    updateUserProfileUseCase,
    changePasswordUseCase,
    requestEmailChangeUseCase,
    verifyEmailChangeUseCase,
    uploadProfileImageUseCase,
    deleteProfileImageUseCase,
    searchUsersByEmailUseCase
);

const uploadController = new UploadController(uploadChatImageUseCase);

// Workspace Use Cases
const createWorkspaceUseCase = new CreateWorkspaceUseCase(workspaceRepository, workspaceMemberRepository);
const joinWorkspaceUseCase = new JoinWorkspaceUseCase(workspaceRepository, workspaceMemberRepository);
const getUserWorkspacesUseCase = new GetUserWorkspacesUseCase(workspaceRepository, workspaceMemberRepository);
const getPublicWorkspacesUseCase = new GetPublicWorkspacesUseCase(workspaceRepository);
const verifyInviteCodeUseCase = new VerifyInviteCodeUseCase(workspaceRepository);
const getWorkspaceMembersUseCase = new GetWorkspaceMembersUseCase(workspaceRepository, workspaceMemberRepository, userRepository);
const handleJoinRequestUseCase = new HandleJoinRequestUseCase(workspaceRepository, workspaceMemberRepository);

// Initialize Channel Repositories early so Workspace Use Cases can use them for cascade deletes
const channelRepository = new ChannelRepository();
const channelMemberRepository = new ChannelMemberRepository();
const messageRepository = new MessageRepository();

const removeWorkspaceMemberUseCase = new RemoveWorkspaceMemberUseCase(
    workspaceRepository, 
    workspaceMemberRepository,
    channelRepository,
    channelMemberRepository
);
const blockWorkspaceMemberUseCase = new BlockWorkspaceMemberUseCase(workspaceRepository, workspaceMemberRepository);
const unblockWorkspaceMemberUseCase = new UnblockWorkspaceMemberUseCase(workspaceRepository, workspaceMemberRepository);
const updateWorkspaceUseCase = new UpdateWorkspaceUseCase(workspaceRepository, workspaceMemberRepository);
const regenerateInviteCodeUseCase = new RegenerateInviteCodeUseCase(workspaceRepository, workspaceMemberRepository);
const deleteWorkspaceUseCase = new DeleteWorkspaceUseCase(workspaceRepository, workspaceMemberRepository);
const sendWorkspaceInviteUseCase = new SendWorkspaceInviteUseCase(workspaceRepository, workspaceMemberRepository, userRepository, emailService);

const workspaceController = new WorkspaceController(
    createWorkspaceUseCase,
    joinWorkspaceUseCase,
    getUserWorkspacesUseCase,
    getPublicWorkspacesUseCase,
    verifyInviteCodeUseCase,
    getWorkspaceMembersUseCase,
    handleJoinRequestUseCase,
    removeWorkspaceMemberUseCase,
    blockWorkspaceMemberUseCase,
    unblockWorkspaceMemberUseCase,
    updateWorkspaceUseCase,
    regenerateInviteCodeUseCase,
    deleteWorkspaceUseCase,
    sendWorkspaceInviteUseCase
);

// Channel & Message Instantiations
const createChannelUseCase = new CreateChannelUseCase(channelRepository, channelMemberRepository);
const getWorkspaceChannelsUseCase = new GetWorkspaceChannelsUseCase(channelRepository, channelMemberRepository);
const getChannelMembersUseCase = new GetChannelMembersUseCase(channelRepository, channelMemberRepository, userRepository);
const addChannelMemberUseCase = new AddChannelMemberUseCase(channelRepository, channelMemberRepository, workspaceMemberRepository, userRepository);
const removeChannelMemberUseCase = new RemoveChannelMemberUseCase(channelRepository, channelMemberRepository, userRepository);
const blockChannelMemberUseCase = new BlockChannelMemberUseCase(channelRepository, channelMemberRepository, userRepository);
const getBlockedChannelMembersUseCase = new GetBlockedChannelMembersUseCase(channelRepository, channelMemberRepository, userRepository);
const unblockChannelMemberUseCase = new UnblockChannelMemberUseCase(channelRepository, channelMemberRepository);
const updateChannelUseCase = new UpdateChannelUseCase(channelRepository);
const leaveChannelUseCase = new LeaveChannelUseCase(channelRepository, channelMemberRepository);
const deleteChannelUseCase = new DeleteChannelUseCase(channelRepository);
const joinChannelUseCase = new JoinChannelUseCase(channelRepository, channelMemberRepository, workspaceRepository, userRepository);
const getChannelRequestsUseCase = new GetChannelRequestsUseCase(channelMemberRepository, userRepository);
const updateChannelRequestUseCase = new UpdateChannelRequestUseCase(channelMemberRepository, channelRepository);
const markChannelAsReadUseCase = new MarkChannelAsReadUseCase(channelMemberRepository);
const getUnreadCountsUseCase = new GetUnreadCountsUseCase(channelRepository, channelMemberRepository, messageRepository);

const sendMessageUseCase = new SendMessageUseCase(messageRepository, channelMemberRepository);
const getChannelMessagesUseCase = new GetChannelMessagesUseCase(messageRepository);

const channelController = new ChannelController(
    createChannelUseCase, 
    getWorkspaceChannelsUseCase,
    getChannelMembersUseCase,
    addChannelMemberUseCase,
    removeChannelMemberUseCase,
    blockChannelMemberUseCase,
    getBlockedChannelMembersUseCase,
    unblockChannelMemberUseCase,
    updateChannelUseCase,
    leaveChannelUseCase,
    deleteChannelUseCase,
    joinChannelUseCase,
    getChannelRequestsUseCase,
    updateChannelRequestUseCase,
    markChannelAsReadUseCase,
    getUnreadCountsUseCase,
    messageRepository
);
const messageController = new MessageController(sendMessageUseCase, getChannelMessagesUseCase);

// Poll Instantiations
const pollRepository = new PollRepository();
const createPollUseCase = new CreatePollUseCase(pollRepository);
const votePollUseCase = new VotePollUseCase(pollRepository);
const getWorkspacePollsUseCase = new GetWorkspacePollsUseCase(pollRepository);
const getChannelPollsUseCase = new GetChannelPollsUseCase(pollRepository);
const deletePollUseCase = new DeletePollUseCase(pollRepository);
const closePollUseCase = new ClosePollUseCase(pollRepository);

const pollController = new PollController(
    createPollUseCase,
    votePollUseCase,
    getWorkspacePollsUseCase,
    getChannelPollsUseCase,
    deletePollUseCase,
    closePollUseCase
);

// DM Imports
import { ConversationRepository } from "../infra/database/repositories/ConversationRepository";
import { DirectMessageRepository } from "../infra/database/repositories/DirectMessageRepository";
import { StartConversationUseCase } from "../application/use-cases/dm/StartConversationUseCase";
import { GetConversationsUseCase } from "../application/use-cases/dm/GetConversationsUseCase";
import { SendDirectMessageUseCase } from "../application/use-cases/dm/SendDirectMessageUseCase";
import { GetDirectMessagesUseCase } from "../application/use-cases/dm/GetDirectMessagesUseCase";
import { MarkMessageAsSeenUseCase } from "../application/use-cases/dm/MarkMessageAsSeenUseCase";
import { DMController } from "../interfaces/controllers/DMController";

// DM Instantiations
const conversationRepository = new ConversationRepository();
const dmRepository = new DirectMessageRepository();

const startConversationUseCase = new StartConversationUseCase(conversationRepository, workspaceMemberRepository);
const getConversationsUseCase = new GetConversationsUseCase(conversationRepository, userRepository, dmRepository);
const sendDirectMessageUseCase = new SendDirectMessageUseCase(dmRepository, conversationRepository);
const getDirectMessagesUseCase = new GetDirectMessagesUseCase(dmRepository, conversationRepository);
const markMessageAsSeenUseCase = new MarkMessageAsSeenUseCase(dmRepository, conversationRepository);

const dmController = new DMController(
    startConversationUseCase,
    getConversationsUseCase,
    sendDirectMessageUseCase,
    getDirectMessagesUseCase,
    markMessageAsSeenUseCase
);

export { logger, authController, adminController, userController, workspaceController, channelController, messageController, dmController, pollController, uploadController, jwtService };
