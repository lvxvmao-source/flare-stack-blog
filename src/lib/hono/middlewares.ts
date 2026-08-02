import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { getAuth } from "@/lib/auth/auth.server";
import { CACHE_CONTROL } from "@/lib/constants";
import { getDb } from "@/lib/db";
import type { Duration } from "@/lib/duration";
import { serverEnv } from "@/lib/env/server.env";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { isPathValid } from "./path-manifest.generated";

declare module "hono" {
  interface ContextVariableMap {
    db: ReturnType<typeof getDb>;
    auth: ReturnType<typeof getAuth>;
  }
}

export const baseMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const db = getDb(c.env);
    const auth = getAuth({ db, env: c.env });
    c.set("db", db);
    c.set("auth", auth);
    return next();
  },
);

const tryCacheResponse = (c: Context, cache: Cache) => {
  let strategy:
    | typeof CACHE_CONTROL.notFound
    | typeof CACHE_CONTROL.serverError
    | typeof CACHE_CONTROL.forbidden
    | null = null;
  if (c.res.status === 404) {
    strategy = CACHE_CONTROL.notFound;
  } else if (c.res.status >= 500) {
    strategy = CACHE_CONTROL.serverError;
  }
  if (strategy) {
    Object.entries(strategy).forEach(([k, v]) => {
      c.res.headers.set(k, v);
    });
  }

  const resCacheControl = c.res.headers.get("Cache-Control");
  const hasSetCookie = c.res.headers.has("Set-Cookie");

  const isStatusCacheable =
    c.res.status === 200 || c.res.status === 404 || c.res.status >= 500;

  const isCacheable =
    isStatusCacheable &&
    !hasSetCookie &&
    resCacheControl &&
    !resCacheControl.includes("no-store") &&
    !resCacheControl.includes("no-cache") &&
    !resCacheControl.includes("private");

  if (!isCacheable) return;

  const responseToCache = c.res.clone();
  c.executionCtx.waitUntil(
    cache.put(c.req.raw, responseToCache).catch(() => {}),
  );
};

export const cacheMiddleware = createMiddleware(async (c, next) => {
  if (c.req.method !== "GET") {
    return next();
  }

  const path = c.req.path;

  // 排除所有 API 路由、需要 session 的路由、以及 server function 调用
  // API 路由有自己的 KV 缓存层，不需要 CDN 级别的 HTTP 缓存
  const EXCLUDED_PREFIXES = ["/api/", "/_serverFn/"];
  if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return next();
  }

  // 缓存响应逻辑（仅用于静态 HTML 页面）
  const cache = (caches as unknown as { default: Cache }).default;

  // Only serve cache if the response has a valid max-age (not stale)
  const cachedResponse = await cache.match(c.req.raw);
  if (cachedResponse) {
    const cacheControl = cachedResponse.headers.get("Cache-Control") ?? "";
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const maxAge = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) : 0;
    // Only use cache if max-age > 0 (meaning it was explicitly cached with a TTL)
    if (maxAge > 0) return cachedResponse;
  }

  await next();

  // Only cache responses that have explicit positive max-age
  const resCacheControl = c.res.headers.get("Cache-Control") ?? "";
  const resMaxAgeMatch = resCacheControl.match(/max-age=(\d+)/);
  const resMaxAge = resMaxAgeMatch ? Number.parseInt(resMaxAgeMatch[1], 10) : 0;
  if (resMaxAge > 0) {
    tryCacheResponse(c, cache);
  }
});

const SHIELD_ALLOWED_PATHS = new Set([
  "/atom.xml",
  "/feed.json",
  "/robots.txt",
  "/rss.xml",
  "/site.webmanifest",
  "/sitemap.xml",
]);

interface RateLimitOptions {
  capacity: number;
  interval: Duration;
  identifier: string | ((c: Context) => string | undefined);
}

export const rateLimitMiddleware = (options: RateLimitOptions) =>
  createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const identifier =
      typeof options.identifier === "function"
        ? options.identifier(c)
        : options.identifier;
    const id = c.env.RATE_LIMITER.idFromName(identifier ?? "unknown");
    const rateLimiter = c.env.RATE_LIMITER.get(id);

    const result = await rateLimiter.checkLimit({
      capacity: options.capacity,
      interval: options.interval,
    });

    if (!result.allowed) {
      c.res.headers.set("Retry-After", result.retryAfterMs.toString());
      return c.json(
        {
          code: "RATE_LIMITED",
          message: "Too Many Requests",
          retryAfterMs: result.retryAfterMs,
        },
        429,
      );
    }

    return next();
  });

export const shieldMiddleware = createMiddleware(async (c, next) => {
  if (serverEnv(c.env).ENVIRONMENT === "dev") return next();

  const path = c.req.path;

  if (
    // 静态资源
    path.startsWith("/assets/") ||
    path.startsWith("/favicon") ||
    SHIELD_ALLOWED_PATHS.has(path) ||
    path.startsWith("/apple-touch-icon") ||
    path.startsWith("/web-app-manifest") ||
    // Server Function
    path.startsWith("/_serverFn/")
  ) {
    return next();
  }

  if (isPathValid(path)) {
    return next();
  }
  const response = c.text("Not Found", 404);
  // 只缓存 Shield 拦截的 404，保护正常 404
  Object.entries(CACHE_CONTROL.notFound).forEach(([k, v]) => {
    response.headers.set(k, v);
  });
  return response;
});

/* ======================= Turnstile ====================== */
export const turnstileMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const secretKey = serverEnv(c.env).TURNSTILE_SECRET_KEY;
    if (!secretKey) return next(); // 未配置则跳过验证

    const token = c.req.header("X-Turnstile-Token");
    if (!token) {
      return c.json(
        {
          code: "TURNSTILE_MISSING_TOKEN",
          message: "Missing Turnstile token",
        },
        400,
      );
    }

    const result = await verifyTurnstileToken({ secretKey, token });

    if (!result.success) {
      return c.json(
        {
          code: "TURNSTILE_VERIFICATION_FAILED",
          message: "Turnstile verification failed",
        },
        403,
      );
    }

    return next();
  },
);
