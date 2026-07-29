import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div
      className="flex h-dvh flex-col gap-4 p-6"
      data-testid="app-loading"
      aria-busy="true"
      aria-label="Loading application"
    >
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-full w-full rounded-xl" />
    </div>
  );
}
