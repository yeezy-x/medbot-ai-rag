import { Hero } from "@/modules/marketing/components/hero";
import { FeatureStrip } from "@/components/marketing/feature-strip";
import { HowItWorks } from "@/modules/marketing/components/how-it-works";
import { TechStackSection } from "@/modules/marketing/components/tech-stack-section";
import { LandingCta } from "@/modules/marketing/components/landing-cta";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center">
      <Hero />
      <FeatureStrip />
      <HowItWorks />
      <TechStackSection />
      <LandingCta />
    </main>
  );
}
