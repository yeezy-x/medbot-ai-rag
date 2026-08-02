import Link from "next/link";

import { RegisterForm } from "./register-form";
import { GoogleSignInButton } from "./google-sign-in-button";
import { hasGoogleAuth } from "@/config/env";

export function RegisterCard() {
  return (
    <div className="auth-panel w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium tracking-[0.14em] text-teal-400/90 uppercase">
          MedBot
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Grounded medical answers with citations — start free.
        </p>
      </div>

      <RegisterForm />

      {hasGoogleAuth && (
        <>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <GoogleSignInButton />
        </>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to use MedBot for research only — not as a
        medical device.{" "}
        <Link href="/" className="underline-offset-4 hover:underline">
          Learn more
        </Link>
      </p>
    </div>
  );
}
