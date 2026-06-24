// src/app/(marketing)/page.tsx

import { Hero } from "@/modules/marketing/components/hero";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Hero />
    </main>
  );
}