// src/modules/auth/components/logout-button.tsx

"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] =
    useTransition();

  function handleLogout() {
    startTransition(async () => {
      await signOut({
        callbackUrl: "/",
      });
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending
        ? "Signing Out..."
        : "Logout"}
    </Button>
  );
}