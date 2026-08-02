import { MfaChallengeForm } from "@/modules/auth/components/mfa-challenge-form";

export default function MfaPage() {
  return (
    <div className="auth-panel w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium tracking-[0.14em] text-teal-400/90 uppercase">
          MedBot
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Two-factor authentication
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter a code from your authenticator app to continue.
        </p>
      </div>
      <MfaChallengeForm />
    </div>
  );
}
