import { auth } from "@/auth";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import Link from "next/link";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between">
      <Link
        href="/"
        className="font-semibold text-lg"
      >
        MedBot
      </Link>

      <div className="flex items-center gap-4">
        {session?.user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm"
            >
              Dashboard
            </Link>

            <span className="text-sm text-muted-foreground">
              {session.user.name ??
                session.user.email}
            </span>

            <LogoutButton />
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm underline underline-offset-4 hover:text-foreground"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}