export {
  isValidEmail,
  isDigitOnly,
  PASSWORD_MIN_LENGTH,
  OTP_LENGTH,
} from './common.validation';

export {
  validateLoginCredentials,
  validateRegisterForm,
  validateForgotPasswordEmail,
  validateResetPassword,
  validateOtp,
  type RegisterFieldErrors,
} from './auth.validation';

export {
  validateAdminForgotEmail,
  validateAdminOtp,
  validateAdminResetPassword,
} from './admin-auth.validation';

export {
  validateChangePassword,
  validateNewEmail,
  validateEmailChangeOtp,
  normalizeSkillToAdd,
} from './profile.validation';

export {
  validateImageFile,
  validateProfileImageFile,
  validateWorkspaceIconFile,
} from './file.validation';

export {
  validateInviteEmail,
  validateWorkspaceInviteCode,
} from './invite.validation';

export {
  POLL_MIN_OPTIONS,
  POLL_MAX_OPTIONS,
  validateCreatePoll,
  getValidPollOptions,
} from './poll.validation';

export {
  WORKSPACE_NAME_MIN,
  WORKSPACE_NAME_MAX,
  validateWorkspaceName,
  validateWorkspaceTeamSize,
} from './workspace.validation';

export {
  CHANNEL_NAME_MIN,
  CHANNEL_NAME_MAX,
  normalizeChannelName,
  validateChannelName,
} from './channel.validation';
