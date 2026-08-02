"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

type ApiEnvelope = {
  success: boolean;
  error?: { message?: string };
  data?: unknown;
};

function VerifyInner() {
  const params = useSearchParams();
  const registered = params.get("registered");
  const token = params.get("token");
  const emailParam = params.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token || !emailParam) return;
    setBusy(true);
    void apiClient<ApiEnvelope>("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailParam, token }),
    }).then((res) => {
      setBusy(false);
      if (res.success) {
        setStatus("ok");
        toast.success("Email verified");
      } else {
        setStatus("error");
        toast.error(res.error?.message ?? "Verification failed");
      }
    });
  }, [token, emailParam]);

  async function resend() {
    setBusy(true);
    const res = await apiClient<ApiEnvelope>("/api/auth/verify-email", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (res.success) {
      toast.success("If an account exists, a verification email was sent");
    } else {
      toast.error(res.error?.message ?? "Could not resend");
    }
  }

  return (
    <div className="space-y-4">
      {registered && (
        <p className="text-sm text-muted-foreground">
          Account created. Check your inbox for a verification link.
        </p>
      )}
      {status === "ok" && (
        <p className="text-sm text-emerald-400">
          Your email is verified.{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">
          Verification link invalid or expired. Request a new one below.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button
        type="button"
        className="w-full"
        disabled={busy || !email}
        onClick={resend}
      >
        {busy ? "Working…" : "Resend verification"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyPage() {
  return (
    <div className="auth-panel w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium tracking-[0.14em] text-teal-400/90 uppercase">
          MedBot
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>
      </div>
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <VerifyInner />
      </Suspense>
    </div>
  );
}
