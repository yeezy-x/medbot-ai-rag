import Link from "next/link";

export default function ClerkAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.35_0.06_180_/_0.25),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.25_0.04_200_/_0.2),_transparent_50%)]"
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-[0.35]"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col md:flex-row">
        <aside className="hidden flex-1 flex-col justify-between p-10 md:flex lg:p-14">
          <Link
            href="/"
            className="text-sm font-medium tracking-[0.16em] text-teal-400 uppercase"
          >
            MedBot
          </Link>
          <div className="max-w-sm space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Grounded answers.
              <br />
              Cited sources.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in to ask clinical questions backed by encyclopedia retrieval —
              every claim traceable to a page.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Not a medical device. Always verify with a licensed clinician.
          </p>
        </aside>

        <main className="flex flex-1 items-center justify-center p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
