import { Skeleton } from "@/components/ui/skeleton";

export function NavPageSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-6 md:px-0">
      {/* Header Skeleton */}
      <header className="py-12 md:py-20 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-5 w-3/4 max-w-xl" />
      </header>

      {/* Posts List Skeleton */}
      <div className="border-t border-border/40 pt-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-border/40 last:border-0 py-8 space-y-3"
          >
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
