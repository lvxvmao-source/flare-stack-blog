import { Skeleton } from "@/components/ui/skeleton";

export function NavPageSkeleton() {
  return (
    <div className="fuwari-onload-animation flex flex-col gap-4">
      {/* Header Skeleton */}
      <div className="fuwari-card-base w-full px-10 py-10 flex flex-col gap-3">
        <Skeleton className="h-9 w-64 bg-black/10 dark:bg-white/10" />
        <Skeleton className="h-5 w-full max-w-lg bg-black/10 dark:bg-white/10" />
        <Skeleton className="h-5 w-3/4 max-w-lg bg-black/10 dark:bg-white/10" />
      </div>

      {/* Posts List Skeleton */}
      <div className="fuwari-card-base w-full px-8 py-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded-lg flex flex-row justify-start items-center mb-2 last:mb-0"
          >
            <div className="w-[15%] md:w-[10%] flex justify-end pr-2">
              <Skeleton className="h-4 w-10 bg-black/10 dark:bg-white/10" />
            </div>
            <div className="w-[15%] md:w-[10%] relative h-full flex items-center before:absolute before:w-1 left-1/2 -ml-0.5 pointer-events-none before:border-l-2 before:border-dashed before:border-black/5 dark:before:border-white/5 before:-top-5 before:bottom-0 before:h-20 z-0">
              <div className="mx-auto w-2 h-2 rounded-full bg-black/20 dark:bg-white/20 z-10" />
            </div>
            <div className="w-[70%] md:w-[65%] flex justify-start pl-2">
              <Skeleton className="h-5 w-3/4 max-w-50 bg-black/10 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
