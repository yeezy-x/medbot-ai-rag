// src/app/(app)/chat/error.tsx

"use client";

export default function Error({
  error,
}: {
  error: Error;
}) {
  return (
    <div className="p-8">
      <h1>Chat Error</h1>

      <p>{error.message}</p>
    </div>
  );
}