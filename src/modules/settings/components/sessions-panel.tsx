"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

type SessionRow = {
  id: string;
  deviceLabel: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  createdAt: string;
  current: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

export function SessionsPanel() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await apiClient<ApiEnvelope<SessionRow[]>>("/api/auth/sessions");
    if (res.success && res.data) setSessions(res.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function revoke(id: string) {
    setBusy(true);
    const res = await apiClient<ApiEnvelope<unknown>>(
      `/api/auth/sessions/${id}`,
      { method: "DELETE" }
    );
    setBusy(false);
    if (!res.success) {
      toast.error(res.error?.message ?? "Could not revoke session");
      return;
    }
    toast.success("Session revoked");
    await load();
  }

  async function revokeOthers() {
    setBusy(true);
    const res = await apiClient<ApiEnvelope<unknown>>("/api/auth/sessions", {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.success) {
      toast.error(res.error?.message ?? "Could not revoke sessions");
      return;
    }
    toast.success("Other sessions signed out");
    await load();
  }

  if (!sessions) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No active sessions.</p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-border rounded-lg border border-border">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {s.deviceLabel ?? "Unknown device"}
                {s.current && (
                  <span className="ml-2 text-xs font-normal text-teal-400">
                    This device
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.ipAddress ?? "IP unknown"} ·{" "}
                {formatDistanceToNow(new Date(s.lastActiveAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {!s.current && (
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => revoke(s.id)}
              >
                Revoke
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        disabled={busy || sessions.length < 2}
        onClick={revokeOthers}
      >
        Sign out other sessions
      </Button>
    </div>
  );
}
