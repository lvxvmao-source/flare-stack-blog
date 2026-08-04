import type { PostFrontmatter } from "@/features/import-export/import-export.schema";
import { PostFrontmatterSchema } from "@/features/import-export/import-export.schema";

/**
 * 简易 YAML 解析器 — 仅处理简单键值对、数组、布尔值、数字和字符串
 * 浏览器兼容，无需 Node.js Buffer
 */
function parseSimpleYaml(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = raw.split("\n");
  let currentKey = "";
  let currentArray: string[] = [];

  function flushArray() {
    if (currentKey && currentArray.length > 0) {
      result[currentKey] = [...currentArray];
    }
    currentKey = "";
    currentArray = [];
  }

  for (const line of lines) {
    // 跳过空行和纯注释行
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue;

    // 数组项: - value
    const arrMatch = line.match(/^\s*-\s+(.+?)\s*$/);
    if (arrMatch && currentKey) {
      const val = arrMatch[1].trim();
      // 去掉引号
      currentArray.push(val.replace(/^["']|["']$/g, ""));
      continue;
    }

    // 遇到新的键值对时，先提交之前的数组
    flushArray();

    // 键值对: key: value
    const kvMatch = line.match(/^(\w[\w_-]*)\s*:\s*(.*?)\s*$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let rawVal = kvMatch[2];

      // 去掉引号
      rawVal = rawVal.replace(/^["']|["']$/g, "");

      if (rawVal === "" || rawVal === "~") {
        result[key] = null;
      } else if (rawVal === "true") {
        result[key] = true;
      } else if (rawVal === "false") {
        result[key] = false;
      } else if (/^-?\d+(\.\d+)?$/.test(rawVal)) {
        result[key] = Number(rawVal);
      } else {
        result[key] = rawVal;
      }
      currentKey = key;
    }
  }

  // 提交最后的数组
  flushArray();

  return result;
}

/**
 * 生成 YAML frontmatter + Markdown 内容
 */
export function stringifyFrontmatter(
  frontmatter: PostFrontmatter,
  markdownContent: string,
): string {
  const lines: string[] = ["---"];
  if (frontmatter.title) lines.push(`title: "${frontmatter.title}"`);
  if (frontmatter.slug) lines.push(`slug: "${frontmatter.slug}"`);
  if (frontmatter.summary) lines.push(`summary: "${frontmatter.summary}"`);
  lines.push(`status: ${frontmatter.status}`);
  if (frontmatter.publishedAt) lines.push(`publishedAt: "${frontmatter.publishedAt}"`);
  if (frontmatter.createdAt) lines.push(`createdAt: "${frontmatter.createdAt}"`);
  if (frontmatter.updatedAt) lines.push(`updatedAt: "${frontmatter.updatedAt}"`);
  lines.push(`readTimeInMinutes: ${frontmatter.readTimeInMinutes}`);
  if (frontmatter.tags.length > 0) {
    for (const tag of frontmatter.tags) {
      lines.push(`  - ${tag}`);
    }
  }
  lines.push("---");
  lines.push("");
  lines.push(markdownContent);
  return lines.join("\n");
}

/**
 * 解析 Markdown 文件的 frontmatter 和正文内容
 * 支持 YAML frontmatter（以 --- 包裹）
 */
export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const trimmed = raw.trimStart();
  // 检查是否以 --- 开头
  if (!trimmed.startsWith("---")) {
    return { data: {}, content: raw };
  }
  // 找到第二个 ---（结束标记），从第 4 个字符开始找
  const endIdx = trimmed.indexOf("\n---", 3);
  if (endIdx === -1) {
    return { data: {}, content: raw };
  }
  const yamlBlock = trimmed.slice(4, endIdx);
  const content = trimmed.slice(endIdx + 4).trimStart();
  const data = parseSimpleYaml(yamlBlock);
  return { data, content };
}

/**
 * 将各种博客平台的 frontmatter 字段映射到统一格式并验证
 * 兼容 Hugo / Hexo / Jekyll 等常见字段名
 */
export function normalizeFrontmatter(
  data: Record<string, unknown>,
): PostFrontmatter | null {
  const mapped: Record<string, unknown> = {};

  // title
  if (typeof data.title === "string") {
    mapped.title = data.title;
  }

  // slug — 多种来源
  const slugSource = data.slug ?? data.url ?? data.permalink;
  if (typeof slugSource === "string") {
    // 从路径中提取最后一段，如 /posts/my-post/ → my-post
    const segments = slugSource.split("/").filter(Boolean);
    mapped.slug = segments[segments.length - 1] ?? slugSource;
  }

  // summary — 多种字段名
  const summarySource = data.summary ?? data.description ?? data.excerpt;
  if (typeof summarySource === "string") {
    mapped.summary = summarySource;
  }

  // status
  if (data.draft === true) {
    mapped.status = "draft";
  } else if (data.status === "draft" || data.status === "published") {
    mapped.status = data.status;
  } else {
    mapped.status = "published";
  }

  // publishedAt — 多种字段名
  const dateSource = data.publishedAt ?? data.date ?? data.published_at;
  if (dateSource) {
    mapped.publishedAt = toISOString(dateSource);
  }

  // createdAt
  const createdSource = data.createdAt ?? data.created_at ?? data.date;
  if (createdSource) {
    mapped.createdAt = toISOString(createdSource);
  }

  // updatedAt
  const updatedSource =
    data.updatedAt ?? data.updated_at ?? data.lastmod ?? data.modified;
  if (updatedSource) {
    mapped.updatedAt = toISOString(updatedSource);
  }

  // readTimeInMinutes
  if (typeof data.readTimeInMinutes === "number") {
    mapped.readTimeInMinutes = data.readTimeInMinutes;
  }

  // tags — 可能是 tags 或 categories
  const tagsSource = data.tags ?? data.categories;
  if (Array.isArray(tagsSource)) {
    mapped.tags = tagsSource.filter((t): t is string => typeof t === "string");
  }

  const result = PostFrontmatterSchema.safeParse(mapped);
  if (!result.success) {
    console.error(
      JSON.stringify({
        message: "Frontmatter normalization validation failed",
        errors: result.error.issues,
        data: mapped,
      }),
    );
    return null;
  }

  return result.data;
}

function toISOString(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return undefined;
}
