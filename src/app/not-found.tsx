// src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">
        Page Not Found
      </h1>

      <Link
        href="/"
        className="underline"
      >
        Go Home
      </Link>
    </div>
  );
}