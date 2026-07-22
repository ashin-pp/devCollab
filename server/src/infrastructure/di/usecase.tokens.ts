export const USECASE_TOKENS = {
    // Admin
    IAdminForgotPasswordUseCase: 'IAdminForgotPasswordUseCase',
    IAdminLoginUseCase: 'IAdminLoginUseCase',
    IAdminRefreshTokenUseCase: 'IAdminRefreshTokenUseCase',
    IAdminResetPasswordUseCase: 'IAdminResetPasswordUseCase',
    ICreateAdminUseCase: 'ICreateAdminUseCase',
    IGetAllUsersUseCase: 'IGetAllUsersUseCase',
    IGetAllWorkspacesUseCase: 'IGetAllWorkspacesUseCase',
    IAdminGetWorkspaceMembersUseCase: 'IAdminGetWorkspaceMembersUseCase',
    IToggleUserStatusUseCase: 'IToggleUserStatusUseCase',
    IToggleWorkspaceStatusUseCase: 'IToggleWorkspaceStatusUseCase',
    IUpdateWorkspaceMemberStatusUseCase: 'IUpdateWorkspaceMemberStatusUseCase',

    // AI
    ICreateAIReminderUseCase: 'ICreateAIReminderUseCase',
    ICreateAITaskUseCase: 'ICreateAITaskUseCase',
    IHandleAiCommandUseCase: 'IHandleAiCommandUseCase',
    ISaveAIChatUseCase: 'ISaveAIChatUseCase',

    // Auth
    IForgotPasswordUseCase: 'IForgotPasswordUseCase',
    IGoogleAuthUseCase: 'IGoogleAuthUseCase',
    ILoginUserUseCase: 'ILoginUserUseCase',
    IRefreshTokenUseCase: 'IRefreshTokenUseCase',
    IRegisterUserUseCase: 'IRegisterUserUseCase',
    IResetPasswordUseCase: 'IResetPasswordUseCase',
    ISendOtpUseCase: 'ISendOtpUseCase',
    IVerifyOtpUseCase: 'IVerifyOtpUseCase',
    IVerifyResetOtpUseCase: 'IVerifyResetOtpUseCase',

    // Channel
    IAddChannelMemberUseCase: 'IAddChannelMemberUseCase',
    IBlockChannelMemberUseCase: 'IBlockChannelMemberUseCase',
    ICreateChannelUseCase: 'ICreateChannelUseCase',
    IDeleteChannelUseCase: 'IDeleteChannelUseCase',
    IGetBlockedChannelMembersUseCase: 'IGetBlockedChannelMembersUseCase',
    IGetChannelMembersUseCase: 'IGetChannelMembersUseCase',
    IGetChannelMessagesUseCase: 'IGetChannelMessagesUseCase',
    IGetChannelRequestsUseCase: 'IGetChannelRequestsUseCase',
    IGetUnreadCountsUseCase: 'IGetUnreadCountsUseCase',
    IGetUnreadMessagesUseCase: 'IGetUnreadMessagesUseCase',
    IGetWorkspaceChannelsUseCase: 'IGetWorkspaceChannelsUseCase',
    IJoinChannelUseCase: 'IJoinChannelUseCase',
    ILeaveChannelUseCase: 'ILeaveChannelUseCase',
    IMarkChannelAsReadUseCase: 'IMarkChannelAsReadUseCase',
    IRemoveChannelMemberUseCase: 'IRemoveChannelMemberUseCase',
    ISendMessageUseCase: 'ISendMessageUseCase',
    IUnblockChannelMemberUseCase: 'IUnblockChannelMemberUseCase',
    IUpdateChannelRequestUseCase: 'IUpdateChannelRequestUseCase',
    IUpdateChannelUseCase: 'IUpdateChannelUseCase',
    IUploadChatImageUseCase: 'IUploadChatImageUseCase',

    // DM
    IGetConversationsUseCase: 'IGetConversationsUseCase',
    IGetDirectMessagesUseCase: 'IGetDirectMessagesUseCase',
    IMarkMessageAsSeenUseCase: 'IMarkMessageAsSeenUseCase',
    ISendDirectMessageUseCase: 'ISendDirectMessageUseCase',
    IStartConversationUseCase: 'IStartConversationUseCase',

    // Notification
    IClearUserNotificationsUseCase: 'IClearUserNotificationsUseCase',
    ICreateNotificationUseCase: 'ICreateNotificationUseCase',
    IGetUserNotificationsUseCase: 'IGetUserNotificationsUseCase',
    IMarkNotificationReadUseCase: 'IMarkNotificationReadUseCase',

    // Poll
    IClosePollUseCase: 'IClosePollUseCase',
    ICreatePollUseCase: 'ICreatePollUseCase',
    IDeletePollUseCase: 'IDeletePollUseCase',
    IGetChannelPollsUseCase: 'IGetChannelPollsUseCase',
    IGetWorkspacePollsUseCase: 'IGetWorkspacePollsUseCase',
    IVotePollUseCase: 'IVotePollUseCase',

    // User
    IChangePasswordUseCase: 'IChangePasswordUseCase',
    IDeleteProfileImageUseCase: 'IDeleteProfileImageUseCase',
    IGetUserByNameUseCase: 'IGetUserByNameUseCase',
    IGetUserProfileUseCase: 'IGetUserProfileUseCase',
    IRequestEmailChangeUseCase: 'IRequestEmailChangeUseCase',
    ISearchUserByEmailUseCase: 'ISearchUserByEmailUseCase',
    IUpdateUserProfileUseCase: 'IUpdateUserProfileUseCase',
    IUploadProfileImageUseCase: 'IUploadProfileImageUseCase',
    IVerifyEmailChangeUseCase: 'IVerifyEmailChangeUseCase',

    // Workspace
    IBlockWorkspaceMemberUseCase: 'IBlockWorkspaceMemberUseCase',
    ICreateWorkspaceUseCase: 'ICreateWorkspaceUseCase',
    IDeleteWorkspaceUseCase: 'IDeleteWorkspaceUseCase',
    IGetPublicWorkspacesUseCase: 'IGetPublicWorkspacesUseCase',
    IGetUserWorkspacesUseCase: 'IGetUserWorkspacesUseCase',
    IGetWorkspaceMembersUseCase: 'IGetWorkspaceMembersUseCase',
    IHandleJoinRequestUseCase: 'IHandleJoinRequestUseCase',
    IJoinWorkspaceUseCase: 'IJoinWorkspaceUseCase',
    IRegenerateInviteCodeUseCase: 'IRegenerateInviteCodeUseCase',
    IRemoveWorkspaceMemberUseCase: 'IRemoveWorkspaceMemberUseCase',
    ISendWorkspaceInviteUseCase: 'ISendWorkspaceInviteUseCase',
    IUnblockWorkspaceMemberUseCase: 'IUnblockWorkspaceMemberUseCase',
    IUpdateWorkspaceUseCase: 'IUpdateWorkspaceUseCase',
    IVerifyInviteCodeUseCase: 'IVerifyInviteCodeUseCase'
} as const;
