// src/modules/auth/components/register-card.tsx

import Link from "next/link";
import { RegisterForm } from "./register-form";

export function RegisterCard() {
  return (
    <div className="w-full max-w-md rounded-xl border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">
          MedBot
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create your account
        </p>
      </div>

      <RegisterForm />

      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}