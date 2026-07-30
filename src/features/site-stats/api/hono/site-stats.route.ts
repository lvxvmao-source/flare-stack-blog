import { Hono } from "hono";
import * as SiteStatsRepo from "@/features/site-stats/data/site-stats.data";
import { getServiceContext, setCacheHeaders } from "@/lib/hono/helper";
import { baseMiddleware } from "@/lib/hono/middlewares";

const app = new Hono<{ Bindings: Env }>();

app.use("*", baseMiddleware);

const route = app.get("/", async (c) => {
  const { db } = getServiceContext(c);

  const [publishedPostCount, tagCount, pageViewCount, earliestPublishedAt] =
    await Promise.all([
      SiteStatsRepo.getPublishedPostCount(db),
      SiteStatsRepo.getTagCount(db),
      SiteStatsRepo.getPageViewCount(db),
      SiteStatsRepo.getEarliestPublishedAt(db),
    ]);

  setCacheHeaders(c.res.headers, "public");
  return c.json({
    publishedPostCount,
    tagCount,
    pageViewCount,
    earliestPublishedAt,
  });
});

export default route;
