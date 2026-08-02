"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { PasswordStrengthMeter } from "@/modules/auth/components/password-strength-meter";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "@/modules/auth/schemas/auth.schema";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";

type ApiEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

export function AccountSecurityPanel({
  googleAuthEnabled = false,
}: {
  googleAuthEnabled?: boolean;
}) {
  const [providers, setProviders] = useState<{
    hasPassword: boolean;
    providers: string[];
  } | null>(null);
  const [me, setMe] = useState<{
    name: string;
    email: string;
    emailVerified: string | null;
  } | null>(null);

  useEffect(() => {
    void apiClient<ApiEnvelope<{ name: string; email: string; emailVerified: string | null }>>(
      "/api/auth/me"
    ).then((r) => {
      if (r.success && r.data) setMe(r.data);
    });
    void apiClient<
      ApiEnvelope<{ hasPassword: boolean; providers: string[] }>
    >("/api/auth/account/providers").then((r) => {
      if (r.success && r.data) setProviders(r.data);
    });
  }, []);

  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: me?.name },
  });

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema) as never,
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordWatch = passwordForm.watch("password") || "";

  async function saveProfile(data: z.infer<typeof updateProfileSchema>) {
    const res = await apiClient<ApiEnvelope>("/api/auth/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.success) {
      toast.error(res.error?.message ?? "Update failed");
      return;
    }
    toast.success("Profile updated");
  }

  async function savePassword(data: z.infer<typeof changePasswordSchema>) {
    const res = await apiClient<ApiEnvelope>("/api/auth/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.success) {
      toast.error(res.error?.message ?? "Password change failed");
      return;
    }
    toast.success("Password updated");
    passwordForm.reset();
  }

  async function exportAccount() {
    const res = await apiClient<ApiEnvelope<Record<string, unknown>>>(
      "/api/auth/account/export"
    );
    if (!res.success || !res.data) {
      toast.error("Export failed");
      return;
    }
    const blob = new Blob([JSON.stringify(res.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medbot-account-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  async function deactivate() {
    const password = window.prompt("Enter your password to deactivate");
    if (!password) return;
    const res = await apiClient<ApiEnvelope>("/api/auth/account/lifecycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.success) {
      toast.error(res.error?.message ?? "Deactivate failed");
      return;
    }
    toast.success("Account deactivated");
    window.location.href = "/login";
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        "Permanently delete your account and chat history? This cannot be undone."
      )
    ) {
      return;
    }
    const password = window.prompt("Enter your password to confirm deletion");
    if (!password) return;
    const res = await apiClient<ApiEnvelope>("/api/auth/account/lifecycle", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.success) {
      toast.error(res.error?.message ?? "Delete failed");
      return;
    }
    toast.success("Account deleted");
    window.location.href = "/";
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Profile</h3>
        {me && !me.emailVerified && (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Email not verified. Check your inbox or resend from the verify page.
          </p>
        )}
        <form
          onSubmit={profileForm.handleSubmit(saveProfile)}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...profileForm.register("name")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={me?.email ?? ""} disabled />
          </div>
          <Button type="submit" size="sm">
            Save profile
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">
          {providers?.hasPassword ? "Change password" : "Set a password"}
        </h3>
        <form
          onSubmit={passwordForm.handleSubmit(savePassword)}
          className="space-y-3"
        >
          {providers?.hasPassword && (
            <div className="space-y-2">
              <Label>Current password</Label>
              <PasswordInput {...passwordForm.register("currentPassword")} />
            </div>
          )}
          {!providers?.hasPassword && (
            <input type="hidden" {...passwordForm.register("currentPassword")} value="" />
          )}
          <div className="space-y-2">
            <Label>New password</Label>
            <PasswordInput {...passwordForm.register("password")} />
            <PasswordStrengthMeter password={passwordWatch} />
          </div>
          <div className="space-y-2">
            <Label>Confirm</Label>
            <PasswordInput {...passwordForm.register("confirmPassword")} />
          </div>
          <Button type="submit" size="sm">
            Update password
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Connected accounts</h3>
        <p className="text-xs text-muted-foreground">
          Providers:{" "}
          {(providers?.providers.length
            ? providers.providers.join(", ")
            : "None") +
            (providers?.hasPassword ? " · password" : "")}
        </p>
        {googleAuthEnabled && !providers?.providers.includes("google") && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => signIn("google", { callbackUrl: "/settings" })}
          >
            Connect Google
          </Button>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Data</h3>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={exportAccount}>
            Export account
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={deactivate}>
            Deactivate
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={deleteAccount}>
            Delete account
          </Button>
        </div>
      </section>
    </div>
  );
}
