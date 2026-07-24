import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex gap-3">
        <Skeleton className="size-7 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-9/12" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="size-7 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-10/12" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}
