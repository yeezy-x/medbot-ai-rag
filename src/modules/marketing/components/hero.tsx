// src/modules/marketing/components/hero.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div>
        <h1 className="text-5xl font-bold">
          MedBot
        </h1>

        <p className="mt-3 text-muted-foreground">
          AI-Powered Medical Knowledge Assistant
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <Button asChild size="lg">
          <Link href="/login">
            Login
          </Link>
        </Button>

        <p className="text-sm text-muted-foreground">
          Dont have an account?
        </p>

        <Button
          variant="outline"
          asChild
          size="lg"
        >
          <Link href="/register">
            Create Account
          </Link>
        </Button>
      </div>
    </div>
  );
}