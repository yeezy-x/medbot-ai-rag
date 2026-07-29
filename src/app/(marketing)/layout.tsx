import { ReactNode } from "react";

import { MarketingFooter } from "@/modules/marketing/components/marketing-footer";
import { MarketingHeader } from "@/modules/marketing/components/marketing-header";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <MarketingHeader />
      <div className="flex-1">{children}</div>
      <MarketingFooter />
    </div>
  );
}
