# Authentication architecture

MedBot uses **Auth.js v5 (NextAuth)** with a JWT session strategy plus an application-level **AuthSession registry** (`jti`) for multi-device session management and revocation.

## Mental model

```text
Browser → (auth) pages / Server Actions / signIn
       → lib/auth.ts (thin Auth.js wiring)
       → modules/auth/services/*
       → repositories → Prisma → Postgres

proxy.ts + requireUser / requireApiUser → JWT + jti + MFA / trusted device
```

Business logic lives in `src/modules/auth/services/`. Route handlers and pages stay thin.

## Features

| Area | Implementation |
| --- | --- |
| Password | Argon2id (lazy bcrypt → Argon2 rehash on login) |
| Email verify / reset | `AuthToken` hashed tokens + `EmailService` (Resend or console) |
| Google OAuth | Explicit link on verified Google email; set password later |
| MFA | TOTP + recovery codes + trusted device cookie + step-up window |
| Sessions | `AuthSession` rows; list / revoke one / revoke others; `tokenVersion` logout-all |
| RBAC | Roles `USER`, `DOCTOR`, `RESEARCHER`, `ADMIN` + permission map |
| Audit | `AuditLog` for security events |
| Account | Profile, password, email change, export, deactivate, delete |

## Env

See [`.env.example`](../../.env.example):

- `AUTH_SECRET` — cookie / JWT signing
- `AUTH_MFA_ENCRYPTION_KEY` — MFA secret encryption (falls back to `AUTH_SECRET` in dev)
- `AUTH_GOOGLE_*`, `AUTH_RESEND_KEY`, `EMAIL_FROM`

## Stable contracts (do not break)

- `requireUser`, `requireApiUser`, `requireAdmin`, `requireApiAdmin` in `src/lib/auth-utils.ts`
- Session user fields: `id`, `email`, `name`, `role`, `mfaVerified` (plus optional `jti`, `tokenVersion`, `authTime`)
- Chat APIs continue to call `requireApiUser` only

## Secret rotation

1. Rotate `AUTH_SECRET` → all sessions invalidate (users re-login).
2. Rotate `AUTH_MFA_ENCRYPTION_KEY` → existing MFA secrets cannot decrypt; users must reset MFA (store previous key briefly if migrating).

## Threat notes

- Tokens stored hashed (SHA-256); recovery codes hashed
- Generic login / forgot-password responses where appropriate
- Account lockout after repeated failures
- In-process rate limits (pair with edge/WAF in production multi-instance)
- Step-up required for MFA disable / recovery regenerate
