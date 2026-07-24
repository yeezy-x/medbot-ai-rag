import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="font-mono text-[0.75rem] uppercase tracking-widest text-muted-foreground">
        404
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-[0.9rem] text-muted-foreground">
        The route you were looking for doesnt exist or has been moved.
      </p>
      <Button asChild size="lg" className="mt-2 gap-2">
        <Link href="/">
          <Home className="size-4" />
          Back home
        </Link>
      </Button>
    </div>
  );
}
