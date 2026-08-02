"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

import {
  forgotPasswordSchema,
} from "@/modules/auth/schemas/auth.schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

type Values = z.infer<typeof forgotPasswordSchema>;

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: Values) {
    const res = await apiClient<
      ApiEnvelope<{ message: string; devResetUrl?: string }>
    >("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.success) {
      toast.error(res.error?.message ?? "Request failed");
      return;
    }
    setDone(true);
    if (res.data?.devResetUrl) setDevUrl(res.data.devResetUrl);
    toast.success(res.data?.message ?? "Check your email");
  }

  if (done) {
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          If an account exists for that email, reset instructions have been
          sent.
        </p>
        {devUrl && (
          <p className="break-all rounded-md border border-border bg-muted/40 p-3 text-xs text-foreground">
            Dev reset link:{" "}
            <Link href={devUrl} className="underline">
              {devUrl}
            </Link>
          </p>
        )}
        <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
