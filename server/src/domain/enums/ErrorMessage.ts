export const ErrorMessage = {
    INVALID_OTP: "Invalid OTP",
    EXPIRED_OTP: "OTP has expired",
    USER_NOT_FOUND: "User not found",
    EMAIL_ALREADY_EXISTS: "User with this email already exists!",
    INVALID_CREDENTIALS: "Email or password is incorrect",
    EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
    INTERNAL_SERVER_ERROR: "An unexpected server error occurred",
    PASSWORDS_DO_NOT_MATCH: "Passwords do not match!",
    USER_BLOCKED: "Blocked by Admin"
} as const;
