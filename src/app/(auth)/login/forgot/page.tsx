import Link from "next/link";
import { Suspense } from "react";

import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForgotPasswordPage() {
  return (
    <div className="auth-panel w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium tracking-[0.14em] text-teal-400/90 uppercase">
          MedBot
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you a secure link to choose a new password.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-28 w-full" />}>
        <ForgotPasswordForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
