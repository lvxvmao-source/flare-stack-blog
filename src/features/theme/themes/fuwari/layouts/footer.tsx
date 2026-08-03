import { ClientOnly, useRouteContext } from "@tanstack/react-router";
import type { NavOption } from "@/features/theme/contract/layouts";
import { m } from "@/paraglide/messages";

interface FooterProps {
  navOptions: Array<NavOption>;
}

export function Footer(_: FooterProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const currentYear = new Date().getFullYear();
  const fuwari = siteConfig.theme.fuwari;

  return (
    <>
      <div className="anime-divider my-10 mx-4 md:mx-32">
        <div className="anime-divider-dot" />
      </div>
      <div className="anime-glass rounded-2xl mb-12 flex flex-col items-center justify-center px-6 py-8 gap-3">
        {/* Anime quote */}
        {fuwari.footerQuote && (
          <p className="text-sm fuwari-text-50 text-center italic max-w-md leading-relaxed"
            style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}>
            「{fuwari.footerQuote}」
          </p>
        )}

        <div className="fuwari-text-50 text-sm text-center">
          <ClientOnly fallback="-">
            {m.footer_copyright({
              year: currentYear.toString(),
              author: siteConfig.author,
            })}
          </ClientOnly>{" "}
          /{" "}
          <a
            href="/rss.xml"
            target="_blank"
            rel="noreferrer"
            className="anime-btn-ripple rounded-md px-1 -m-1 font-medium hover:text-(--anime-sakura) text-(--anime-sakura) transition-colors"
          >
            RSS
          </a>{" "}
          /{" "}
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="anime-btn-ripple rounded-md px-1 -m-1 font-medium hover:text-(--anime-sakura) text-(--anime-sakura) transition-colors"
          >
            Sitemap
          </a>
          <br />
          {m.footer_powered_by()}{" "}
          <a
            href="https://tanstack.com/start"
            target="_blank"
            rel="noreferrer"
            className="anime-btn-ripple rounded-md px-1 -m-1 font-medium hover:text-(--anime-sakura) text-(--anime-sakura) transition-colors"
          >
            Tanstack Start
          </a>{" "}
          &{" "}
          <a
            href="https://github.com/du2333/flare-stack-blog"
            target="_blank"
            rel="noreferrer"
            className="anime-btn-ripple rounded-md px-1 -m-1 font-medium hover:text-(--anime-sakura) text-(--anime-sakura) transition-colors"
          >
            Flare Stack Blog
          </a>
        </div>
      </div>
    </>
  );
}
