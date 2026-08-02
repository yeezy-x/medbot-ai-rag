export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const LOCKOUT_MAX_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const SESSION_MAX_AGE_SEC = 24 * 60 * 60; // 24h
export const SESSION_ACTIVITY_THROTTLE_MS = 5 * 60 * 1000; // 5 min

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
export const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const EMAIL_CHANGE_TOKEN_TTL_MS = 60 * 60 * 1000;

export const TRUSTED_DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const STEP_UP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export const RECOVERY_CODE_COUNT = 10;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const RATE_LIMIT_LOGIN_MAX = 20;
export const RATE_LIMIT_RESET_MAX = 5;
export const RATE_LIMIT_VERIFY_MAX = 5;
export const RATE_LIMIT_MFA_MAX = 10;

export const MFA_ISSUER = "MedBot";
