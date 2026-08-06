// API Endpoint Constants
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    GOOGLE: '/auth/google',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RESET_OTP: '/auth/verify-reset-otp',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User endpoints
  USER: {
    PROFILE: '/users/profile',
    PLAN: '/users/plan',
    CHANGE_PASSWORD: '/users/change-password',
    CHANGE_EMAIL_REQUEST: '/users/change-email/request',
    CHANGE_EMAIL_VERIFY: '/users/change-email/verify',
    PROFILE_IMAGE: '/users/profile/image',
    SEARCH: '/users/search',
  },

  // Workspace endpoints
  WORKSPACES: {
    BASE: '/workspaces',
    JOIN: '/workspaces/join',
    ME: '/workspaces/me',
    PUBLIC: '/workspaces/public',
    VERIFY: (code: string) => `/workspaces/verify/${code}`,
    DETAIL: (workspaceId: string) => `/workspaces/${workspaceId}`,
    MEMBERS: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
    MEMBER: (workspaceId: string, memberId: string) => `/workspaces/${workspaceId}/members/${memberId}`,
    BLOCK_MEMBER: (workspaceId: string, memberId: string) => `/workspaces/${workspaceId}/members/${memberId}/block`,
    UNBLOCK_MEMBER: (workspaceId: string, memberId: string) => `/workspaces/${workspaceId}/members/${memberId}/unblock`,
    REQUESTS: (workspaceId: string) => `/workspaces/${workspaceId}/requests`,
    INVITE_CODE: (workspaceId: string) => `/workspaces/${workspaceId}/invite-code`,
    SEND_INVITE: (workspaceId: string) => `/workspaces/${workspaceId}/send-invite`,
  },

  // Channel endpoints
  CHANNELS: {
    LIST: (workspaceId: string) => `/workspaces/${workspaceId}/channels`,
    DETAIL: (workspaceId: string, channelId: string) => `/workspaces/${workspaceId}/channels/${channelId}`,
    MEMBERS: (workspaceId: string, channelId: string) => `/workspaces/${workspaceId}/channels/${channelId}/members`,
    BLOCKED_MEMBERS: (workspaceId: string, channelId: string) => `/workspaces/${workspaceId}/channels/${channelId}/blocked`,
    MEMBER: (workspaceId: string, channelId: string, memberId: string) => `/workspaces/${workspaceId}/channels/${channelId}/members/${memberId}`,
    BLOCK_MEMBER: (workspaceId: string, channelId: string, memberId: string) => `/workspaces/${workspaceId}/channels/${channelId}/members/${memberId}/block`,
    UNBLOCK_MEMBER: (workspaceId: string, channelId: string, memberId: string) => `/workspaces/${workspaceId}/channels/${channelId}/members/${memberId}/unblock`,
    LEAVE: (workspaceId: string, channelId: string) => `/workspaces/${workspaceId}/channels/${channelId}/leave`,
    JOIN: (workspaceId: string, channelId: string) => `/workspaces/${workspaceId}/channels/${channelId}/join`,
    REQUESTS: (workspaceId: string, channelId: string) => `/workspaces/${workspaceId}/channels/${channelId}/requests`,
    REQUEST: (workspaceId: string, channelId: string, userId: string) => `/workspaces/${workspaceId}/channels/${channelId}/requests/${userId}`,
    READ: (workspaceId: string, channelId: string) => `/workspaces/${workspaceId}/channels/${channelId}/read`,
    UNREAD_COUNTS: (workspaceId: string) => `/workspaces/${workspaceId}/channels/unread-counts`,
    DM_UNREAD_COUNTS: (workspaceId: string) => `/workspaces/${workspaceId}/dm/unread-counts`,
    MESSAGES: (workspaceId: string, channelId: string) => `/workspaces/${workspaceId}/channels/${channelId}/messages`,
    THREAD: (workspaceId: string, channelId: string, messageId: string) => `/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}/thread`,
  },

  // DM endpoints
  DM: {
    START_CONVERSATION: (workspaceId: string) => `/workspaces/${workspaceId}/dm`,
    CONVERSATIONS: (workspaceId: string) => `/workspaces/${workspaceId}/dm/conversations`,
    MESSAGES: (conversationId: string) => `/dm/conversations/${conversationId}/messages`,
    MARK_SEEN: (conversationId: string) => `/dm/conversations/${conversationId}/seen`,
  },

  // Admin endpoints
  ADMIN: {
    LOGIN: '/admin/login',
    LOGOUT: '/admin/logout',
    REFRESH: '/admin/refresh',
    FORGOT_PASSWORD: '/admin/forgot-password',
    VERIFY_RESET_OTP: '/admin/verify-reset-otp',
    RESET_PASSWORD: '/admin/reset-password',
    USERS: '/admin/users',
    USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,
    WORKSPACES: '/admin/workspaces',
    WORKSPACE_STATUS: (workspaceId: string) => `/admin/workspaces/${workspaceId}/status`,
    WORKSPACE_MEMBERS: (workspaceId: string) => `/admin/workspaces/${workspaceId}/members`,
    WORKSPACE_MEMBER_STATUS: (workspaceId: string, userId: string) => `/admin/workspaces/${workspaceId}/members/${userId}/status`,
    PLANS: '/admin/plans',
    PLAN_DETAIL: (planId: string) => `/admin/plans/${planId}`,
  },

  // User-facing plans
  PLANS: {
    BASE: '/plans',
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    VERIFY: '/payments/verify',
    RECORD_ATTEMPT: '/payments/record-attempt',
    HISTORY: '/payments/history',
  },

  // Poll endpoints
  POLLS: {
    CREATE: '/polls',
    VOTE: (pollId: string) => `/polls/${pollId}/vote`,
    WORKSPACE: (workspaceId: string) => `/polls/workspace/${workspaceId}`,
    CHANNEL: (channelId: string) => `/polls/channel/${channelId}`,
  },

  // Upload endpoints
  UPLOAD: {
    IMAGE: '/upload/image',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    CLEAR_ALL: '/notifications/clear-all',
  },

  // AI endpoints
  AI: {
    PROCESS: '/ai/process',
  }
};
