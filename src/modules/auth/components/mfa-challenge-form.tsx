"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MfaChallengeForm() {
  const [code, setCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await signIn("mfa-verify", {
      code: code.trim(),
      rememberDevice: rememberDevice ? "true" : "false",
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setBusy(false);
    if (result?.error || result?.ok !== true) {
      setError("Invalid code — try again");
      toast.error("Invalid authentication code");
      return;
    }

    if (rememberDevice) {
      void fetch("/api/auth/mfa/trust-device", { method: "POST" }).catch(
        () => undefined
      );
    }

    window.location.assign("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Authentication code</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code or recovery code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono tracking-wider"
        />
        <p className="text-xs text-muted-foreground">
          Open your authenticator app, or use a recovery code.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={rememberDevice}
          onChange={(e) => setRememberDevice(e.target.checked)}
          className="rounded border-border"
        />
        Remember this device for 30 days
      </label>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={busy || code.trim().length < 6}
      >
        {busy ? "Verifying…" : "Continue"}
      </Button>
    </form>
  );
}
