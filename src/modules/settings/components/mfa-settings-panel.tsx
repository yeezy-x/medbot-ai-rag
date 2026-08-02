"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

async function callApi<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await apiClient<ApiEnvelope<T>>(input, init);
  if (!res.success || res.data === undefined) {
    throw new Error(res.error?.message ?? "Request failed");
  }
  return res.data;
}

export function RecoveryCodesDialog({
  codes,
  onClose,
}: {
  codes: string[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    toast.success("Recovery codes copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal
      aria-labelledby="recovery-title"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 id="recovery-title" className="text-lg font-semibold">
          Save your recovery codes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Store these somewhere safe. Each code can be used once if you lose
          your authenticator.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm">
          {codes.map((c) => (
            <li
              key={c}
              className="rounded-md border border-border bg-muted/30 px-2 py-1.5 text-center"
            >
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={copyAll}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button type="button" className="flex-1" onClick={onClose}>
            I saved them
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MfaSettingsPanel() {
  const [status, setStatus] = useState<{
    mfaEnabled: boolean;
    recoveryCodesRemaining?: number;
  } | null>(null);
  const [setup, setSetup] = useState<{
    qrDataUrl: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const data = await callApi<{
        mfaEnabled: boolean;
        recoveryCodesRemaining: number;
      }>("/api/auth/mfa/setup", { method: "GET" });
      setStatus(data);
    } catch {
      setError("Could not load MFA status");
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function startSetup() {
    setError("");
    setBusy(true);
    try {
      const data = await callApi<{ qrDataUrl: string; secret: string }>(
        "/api/auth/mfa/setup",
        { method: "POST" }
      );
      setSetup({ qrDataUrl: data.qrDataUrl, secret: data.secret });
    } catch {
      setError("Could not start MFA setup");
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetup() {
    setError("");
    setBusy(true);
    try {
      const data = await callApi<{ recoveryCodes: string[] }>(
        "/api/auth/mfa/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );
      setSetup(null);
      setCode("");
      setRecoveryCodes(data.recoveryCodes);
      setMessage("Two-factor authentication is enabled.");
      await loadStatus();
    } catch {
      setError("Invalid code — try again");
    } finally {
      setBusy(false);
    }
  }

  async function disableMfa() {
    setError("");
    setBusy(true);
    try {
      await callApi("/api/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      setCode("");
      setMessage("Two-factor authentication is disabled.");
      await loadStatus();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not disable MFA — re-auth may be required"
      );
    } finally {
      setBusy(false);
    }
  }

  async function regenerateCodes() {
    setBusy(true);
    setError("");
    try {
      const data = await callApi<{ recoveryCodes: string[] }>(
        "/api/auth/mfa/recovery",
        { method: "POST" }
      );
      setRecoveryCodes(data.recoveryCodes);
      await loadStatus();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not regenerate — re-auth required"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Status:{" "}
        <span className="font-medium text-foreground">
          {status?.mfaEnabled ? "Enabled" : "Disabled"}
        </span>
        {status?.mfaEnabled && typeof status.recoveryCodesRemaining === "number" && (
          <span className="ml-2 text-xs">
            · {status.recoveryCodesRemaining} recovery codes left
          </span>
        )}
      </p>

      {setup && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium">1. Scan with your authenticator</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setup.qrDataUrl}
            alt="MFA QR code"
            width={180}
            height={180}
            className="mx-auto rounded-md bg-white p-2"
          />
          <p className="break-all text-xs text-muted-foreground">
            Manual key: {setup.secret}
          </p>
          <div className="space-y-2">
            <Label>2. Confirm with a 6-digit code</Label>
            <Input
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="font-mono tracking-widest"
            />
          </div>
          <Button onClick={confirmSetup} disabled={busy || code.length !== 6}>
            Confirm and enable
          </Button>
        </div>
      )}

      {!setup && !status?.mfaEnabled && (
        <Button onClick={startSetup} disabled={busy}>
          Set up authenticator
        </Button>
      )}

      {!setup && status?.mfaEnabled && (
        <div className="space-y-3">
          <Input
            placeholder="Code to disable MFA"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              onClick={disableMfa}
              disabled={busy || code.length < 6}
            >
              Disable MFA
            </Button>
            <Button variant="outline" onClick={regenerateCodes} disabled={busy}>
              Regenerate recovery codes
            </Button>
          </div>
        </div>
      )}

      {message && <p className="text-sm text-emerald-500">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {recoveryCodes && (
        <RecoveryCodesDialog
          codes={recoveryCodes}
          onClose={() => setRecoveryCodes(null)}
        />
      )}
    </div>
  );
}
