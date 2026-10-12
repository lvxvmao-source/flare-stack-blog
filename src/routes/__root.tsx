import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouteContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/common/theme-provider";
import { siteConfigQuery } from "@/features/config/queries";
import {
  SiteThemeProvider,
  type ThemeName,
  themeMap,
} from "@/features/theme/theme-context";
import { setLive2dVisible } from "@/features/theme/themes/fuwari/components/effects/live2d-widget";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import { clientEnv } from "@/lib/env/client.env";
import { getLocale } from "@/paraglide/runtime";
import appCss from "@/styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    const siteConfig =
      await context.queryClient.ensureQueryData(siteConfigQuery);
    return { siteConfig };
  },
  loader: async ({ context }) => {
    const themeName = (context.siteConfig?.themeName ?? "default") as ThemeName;
    return { siteConfig: context.siteConfig, themeName };
  },
  head: ({ loaderData }) => {
    const env = clientEnv();

    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: loaderData?.siteConfig?.title,
        },
        {
          name: "description",
          content: loaderData?.siteConfig?.description,
        },
      ],
      links: [
        // Google Fonts 的三个中文字体族（ZCOOL XiaoWei / Ma Shan Zheng / Noto Sans SC）
        // 原先以 <link rel="stylesheet"> 同步引入，属于「渲染阻塞资源」——浏览器必须
        // 等它下载完才会开始渲染首屏。而 fonts.googleapis.com 在中国大陆常年不可达，
        // 于是首屏会一直卡在等待、直到请求超时，这是「浏览卡顿」的一个直接来源。
        //
        // 现改为在 RootDocument 中异步注入（见 ASYNC_FONT_SCRIPT）：字体能力保留，
        // 但不再阻塞渲染。preconnect 一并保留，让异步请求能更快建连。
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "icon",
          type: "image/svg+xml",
          href: loaderData?.siteConfig?.icons.faviconSvg,
        },
        {
          rel: "icon",
          type: "image/png",
          href: loaderData?.siteConfig?.icons.favicon96,
          sizes: "96x96",
        },
        {
          rel: "shortcut icon",
          href: loaderData?.siteConfig?.icons.faviconIco,
        },
        {
          rel: "apple-touch-icon",
          type: "image/png",
          href: loaderData?.siteConfig?.icons.appleTouchIcon,
          sizes: "180x180",
        },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS Feed",
          href: "/rss.xml",
        },
        {
          rel: "alternate",
          type: "application/atom+xml",
          title: "Atom Feed",
          href: "/atom.xml",
        },
        {
          rel: "alternate",
          type: "application/feed+json",
          title: "JSON Feed",
          href: "/feed.json",
        },
      ],
      scripts: env.VITE_UMAMI_WEBSITE_ID
        ? [
            {
              src: "/stats.js",
              defer: true,
              "data-website-id": env.VITE_UMAMI_WEBSITE_ID,
            },
          ]
        : [],
    };
  },
  shellComponent: RootDocument,
});

/**
 * Google Fonts 异步加载脚本（ZCOOL XiaoWei / Ma Shan Zheng / Noto Sans SC）。
 *
 * 这三种字体被归档页年份（archive-year）、页脚（footer）与欢迎页使用，因此不能直接
 * 删除，否则这些位置的字体回退会改变外观。
 *
 * 做法：以 `media="print"` 插入 link —— 浏览器视其为非渲染关键资源，不会阻塞首屏；
 * 待其加载完成后再把 media 切回 `all`，字体随即生效。若加载失败（例如国内网络
 * 不可达）则静默忽略，回退到系统字体，与当前的表现一致。全程不阻塞渲染。
 */
const ASYNC_FONT_SCRIPT = `(function(){try{
var href="https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;700&display=swap";
var l=document.createElement("link");
l.rel="stylesheet";l.href=href;l.media="print";
l.onload=function(){l.media="all";};
l.onerror=function(){};
document.head.appendChild(l);
}catch(e){}})();`;

/**
 * Controls whether the Live2D 站娘 (a `document.body` singleton mounted in PublicLayout)
 * is visible. It must show ONLY on the frontend pages — never on the welcome page (`/`)
 * nor the admin area (`/admin`). Driven by the router so it stays correct across
 * navigations even though the widget DOM persists on `body`.
 */
function Live2dVisibilityController() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    setLive2dVisible(!(pathname === "/" || pathname.startsWith("/admin")));
  }, [pathname]);
  return null;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const themeName = (siteConfig?.themeName ?? "default") as ThemeName;
  const currentTheme = themeMap[themeName] ?? themeMap.default;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      style={currentTheme.getDocumentStyle?.(siteConfig)}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        {/* 远程中文字体异步注入，避免阻塞首屏渲染（见 ASYNC_FONT_SCRIPT） */}
        <script dangerouslySetInnerHTML={{ __html: ASYNC_FONT_SCRIPT }} />
        <ThemeProvider>
          <SiteThemeProvider themeName={themeName}>
            {children}
          </SiteThemeProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Live2dVisibilityController />
        <Scripts />
      </body>
    </html>
  );
}
