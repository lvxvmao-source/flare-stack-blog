import { Suspense } from "react";
import { SiteStatsCard } from "./site-stats-card";
import { SiteStatsSkeleton } from "./site-stats-skeleton";
import { MiniCalendar } from "./mini-calendar";

export function RightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
      <div className="sticky top-20">
        <div className="flex flex-col gap-4">
          <Suspense fallback={<SiteStatsSkeleton />}>
            <SiteStatsCard />
          </Suspense>
          <MiniCalendar />
        </div>
      </div>
    </aside>
  );
}
