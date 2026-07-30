import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { isSSR } from "@/lib/utils";
import { fetchSiteStatsFn } from "../api/site-stats.api";

export const SITE_STATS_KEYS = {
  all: ["site-stats"] as const,
};

export const siteStatsQueryOptions = queryOptions({
  queryKey: SITE_STATS_KEYS.all,
  queryFn: async () => {
    if (isSSR) {
      return await fetchSiteStatsFn();
    }
    const res = await apiClient.stats.$get();
    if (!res.ok) throw new Error("Failed to load site stats");
    return res.json();
  },
});
