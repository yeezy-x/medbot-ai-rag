import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="w-full max-w-3xl">
        <div className="mb-2 text-xs text-muted-foreground">
          MedBot
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}