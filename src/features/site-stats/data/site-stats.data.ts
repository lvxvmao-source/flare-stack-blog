import { count, eq, min } from "drizzle-orm";
import { PageViewsTable, PostsTable, TagsTable } from "@/lib/db/schema";

/**
 * 获取已发布文章总数
 */
export async function getPublishedPostCount(db: DB) {
  const [result] = await db
    .select({ count: count() })
    .from(PostsTable)
    .where(eq(PostsTable.status, "published"));
  return result.count;
}

/**
 * 获取标签总数
 */
export async function getTagCount(db: DB) {
  const [result] = await db
    .select({ count: count() })
    .from(TagsTable);
  return result.count;
}

/**
 * 获取网站总浏览量（page_views 表总记录数）
 */
export async function getPageViewCount(db: DB) {
  const [result] = await db
    .select({ count: count() })
    .from(PageViewsTable);
  return result.count;
}

/**
 * 获取最早发布时间（用于计算网站运行时间）
 * 返回最早已发布文章的时间戳，若没有则返回 null
 */
export async function getEarliestPublishedAt(db: DB) {
  const [result] = await db
    .select({ earliest: min(PostsTable.publishedAt) })
    .from(PostsTable)
    .where(eq(PostsTable.status, "published"));
  return result.earliest;
}
