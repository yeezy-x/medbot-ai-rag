"use client";

import { useEffect, useState } from "react";

type Me = {
  role: string;
  email: string;
  name: string;
};

export function AccountRoleBadge() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.success && body.data) {
          setMe(body.data as Me);
        }
      })
      .catch(() => undefined);
  }, []);

  if (!me) {
    return (
      <p className="text-sm text-muted-foreground">Loading account…</p>
    );
  }

  return (
    <div className="space-y-1 text-sm">
      <p>
        <span className="text-muted-foreground">Signed in as </span>
        <span className="font-medium">{me.email}</span>
      </p>
      <p>
        <span className="text-muted-foreground">Role </span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
          {me.role}
        </span>
        {me.role === "ADMIN" && (
          <span className="ml-2 text-xs text-muted-foreground">
            Admin privileges enabled
          </span>
        )}
      </p>
    </div>
  );
}
