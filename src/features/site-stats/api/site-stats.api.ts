import { createServerFn } from "@tanstack/react-start";
import * as SiteStatsRepo from "@/features/site-stats/data/site-stats.data";
import { dbMiddleware } from "@/lib/middlewares";

export const fetchSiteStatsFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const { db } = context;
    const [publishedPostCount, tagCount, pageViewCount, earliestPublishedAt] =
      await Promise.all([
        SiteStatsRepo.getPublishedPostCount(db),
        SiteStatsRepo.getTagCount(db),
        SiteStatsRepo.getPageViewCount(db),
        SiteStatsRepo.getEarliestPublishedAt(db),
      ]);

    return {
      publishedPostCount,
      tagCount,
      pageViewCount,
      earliestPublishedAt,
    };
  });
