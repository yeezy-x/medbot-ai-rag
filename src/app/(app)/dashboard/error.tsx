// src/app/(app)/dashboard/error.tsx

"use client";

export default function Error({
  error,
}: {
  error: Error;
}) {
  return (
    <div className="p-8">
      <h1>Something went wrong</h1>

      <p>{error.message}</p>
    </div>
  );
}