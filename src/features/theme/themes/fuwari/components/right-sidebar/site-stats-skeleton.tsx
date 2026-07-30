export function SiteStatsSkeleton() {
  return (
    <div className="fuwari-card-base p-4 animate-pulse">
      <div className="h-4 w-20 rounded bg-black/10 dark:bg-white/10 mb-3" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/5 dark:bg-white/5"
          >
            <div className="size-[18px] rounded bg-black/10 dark:bg-white/10" />
            <div className="h-6 w-10 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-12 rounded bg-black/10 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
