// src/modules/auth/components/login-card.tsx

import Link from "next/link";
import { LoginForm } from "./login-form";

export function LoginCard() {
  return (
    <div className="w-full max-w-md border rounded-xl p-8 shadow-sm">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">
          MedBot
        </h1>

        <p className="text-muted-foreground">
          Welcome back
        </p>
      </div>

      <LoginForm />

      <div className="mt-6 text-center text-sm">
        Dont have an account?{" "}
        <Link
          href="/register"
          className="underline"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}