import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "./login-form";
import { GoogleSignInButton } from "./google-sign-in-button";
import { MagicLinkForm } from "./magic-link-form";
import { hasGoogleAuth, hasResendAuth } from "@/config/env";
import { Skeleton } from "@/components/ui/skeleton";

export function LoginCard() {
  return (
    <div className="auth-panel w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium tracking-[0.14em] text-teal-400/90 uppercase">
          MedBot
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your workspace.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <LoginForm />
      </Suspense>

      {(hasGoogleAuth || hasResendAuth) && (
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      <div className="space-y-3">
        {hasGoogleAuth && <GoogleSignInButton />}
        {hasResendAuth && <MagicLinkForm />}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
