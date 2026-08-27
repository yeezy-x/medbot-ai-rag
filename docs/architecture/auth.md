# Authentication architecture

MedBot uses **Clerk** for sign-in, sign-up, sessions, MFA, and account security. A local Prisma `User` row is synced on first authenticated request (and via the Clerk webhook) so chats stay keyed to an app-owned UUID.

## Mental model

```text
Browser → Clerk hosted UI (/sign-in, /sign-up)
       → Clerk session cookie
       → proxy.ts clerkMiddleware (page gate)
       → requireUser / requireApiUser
       → ClerkUserService (upsert Prisma User by clerkId)
       → ChatService uses Prisma user.id
```

RBAC (`USER` / `DOCTOR` / `RESEARCHER` / `ADMIN`) lives on the local `User.role` column, not in Clerk organizations.

## Features

| Area | Implementation |
| --- | --- |
| Passwords / social / MFA | Clerk Dashboard + `<SignIn />` / `<SignUp />` / `<UserProfile />` |
| Sessions | Clerk; sign-out via `useClerk().signOut` / `<UserButton />` |
| Local profile | `User.clerkId` unique mapping |
| RBAC | Prisma `role` + `src/modules/auth/constants/permissions.ts` |
| User delete | Clerk `user.deleted` webhook removes the local row (cascades chats) |

## Env

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (`/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (`/sign-up`)
- `CLERK_WEBHOOK_SIGNING_SECRET` (optional locally; required for `/api/webhooks/clerk`)

## Stable contracts (do not break)

- `requireUser`, `requireApiUser`, `requireAdmin`, `requireApiAdmin` in `src/lib/auth-utils.ts`
- Session user fields: `id` (Prisma), `clerkId`, `email`, `name`, `role`, `image`
- Chat APIs continue to call `requireApiUser` only and use Prisma `user.id`

## Promoting an admin

Sign in once so the local row exists, then:

```bash
ADMIN_EMAIL=you@example.com npm run seed
```
