import { useSuspenseQuery } from "@tanstack/react-query";
import { siteStatsQueryOptions } from "@/features/site-stats/queries";
import { differenceInDays } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { FileText, Tag, Eye, CalendarClock } from "lucide-react";

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function SiteStatsCard() {
  const { data: stats } = useSuspenseQuery(siteStatsQueryOptions);

  const runningDays = stats.earliestPublishedAt
    ? differenceInDays(new Date(), new Date(stats.earliestPublishedAt))
    : 0;

  const items = [
    {
      icon: FileText,
      label: m.site_stats_posts(),
      value: formatNumber(stats.publishedPostCount),
    },
    {
      icon: Tag,
      label: m.site_stats_tags(),
      value: formatNumber(stats.tagCount),
    },
    {
      icon: Eye,
      label: m.site_stats_views(),
      value: formatNumber(stats.pageViewCount),
    },
    {
      icon: CalendarClock,
      label: m.site_stats_running_days(),
      value: formatNumber(runningDays),
    },
  ];

  return (
    <div className="fuwari-card-base p-4">
      <h3 className="font-semibold fuwari-text-90 mb-3 text-sm tracking-wide">
        {m.site_stats_title()}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 p-2 rounded-lg"
            style={{ backgroundColor: "var(--fuwari-btn-regular-bg)" }}
          >
            <Icon
              size={18}
              strokeWidth={1.5}
              style={{ color: "var(--fuwari-primary)" }}
            />
            <span className="text-lg font-bold fuwari-text-90">{value}</span>
            <span className="text-xs fuwari-text-50">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
