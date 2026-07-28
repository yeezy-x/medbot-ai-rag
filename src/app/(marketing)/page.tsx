// src/app/(marketing)/page.tsx

import { Hero } from "@/modules/marketing/components/hero";

export default function LandingPage() {
  return (
    <main className="min-h-screen p-6 pb-16">
      <Hero />
    </main>
  );
}