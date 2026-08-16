import { useNavigate, useRouteContext } from "@tanstack/react-router";
import {
  resolveSocialHref,
  SOCIAL_PLATFORMS,
} from "@/features/config/utils/social-platforms";
import { m } from "@/paraglide/messages";
import { SakuraPetals } from "../../components/effects/sakura-petals";

function isVideoBackground(url: string): boolean {
  const lower = url.split("?")[0].toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".webm");
}

const DISPLAY_FONTS: Record<string, string> = {
  zcool: "'ZCOOL XiaoWei', serif",
  mashan: "'Ma Shan Zheng', cursive",
  noto: "'Noto Sans SC', sans-serif",
};

export function WelcomePage() {
  const navigate = useNavigate();
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const fuwari = siteConfig.theme.fuwari;

  // 背景回退链：welcome.background → homeBg → 无（纯 --fuwari-page-bg）
  const background = (
    fuwari.welcome.background.trim() || fuwari.homeBg.trim()
  ).trim();
  const socialLinks = siteConfig.social.filter((link) => link.url);
  const avatar = fuwari.avatar.trim();
  const displayFont = DISPLAY_FONTS[fuwari.displayFont];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-(--fuwari-page-bg) px-6 text-center">
      {/* 背景媒体层 */}
      {background ? (
        <>
          {isVideoBackground(background) ? (
            <video
              src={background}
              poster={fuwari.homeBg.trim() || undefined}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
          ) : (
            <img
              src={background}
              alt=""
              fetchPriority="high"
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
          )}
          {/* 可读性遮罩 */}
          <div className="absolute inset-0 z-10 bg-black/30" />
        </>
      ) : null}

      {/* 樱花特效（欢迎页在 PublicLayout 之外，需自行渲染） */}
      <SakuraPetals
        enabled={fuwari.sakuraEnabled}
        density={fuwari.sakuraDensity}
        speed={fuwari.sakuraSpeed}
      />

      {/* 内容层 */}
      <div className="relative z-20 flex w-full flex-col items-center gap-10">
        {/* 玻璃拟态身份卡片 */}
        <div className="anime-glass flex w-full max-w-md flex-col items-center gap-5 px-8 py-10">
          {/* 1. 头像（樱花光环） */}
          {avatar ? (
            <div className="anime-onload" style={{ animationDelay: "100ms" }}>
              <div className="anime-avatar-ring p-[2px]">
                <img
                  src={avatar}
                  alt={siteConfig.author}
                  className="h-24 w-24 rounded-xl object-cover"
                />
              </div>
            </div>
          ) : null}

          {/* 2. 站点标题 */}
          <h1
            className="anime-onload fuwari-text-90 text-3xl font-bold md:text-4xl"
            style={{ animationDelay: "220ms", fontFamily: displayFont }}
          >
            {siteConfig.title}
          </h1>

          {/* 3. 樱花装饰分隔线 */}
          <div
            className="anime-onload anime-divider w-48"
            style={{ animationDelay: "320ms" }}
          >
            <div className="anime-divider-dot" />
          </div>

          {/* 4. 副标语（站点描述） */}
          {siteConfig.description ? (
            <p
              className="anime-onload fuwari-text-75 max-w-xs text-sm leading-relaxed md:text-base"
              style={{ animationDelay: "420ms" }}
            >
              {siteConfig.description}
            </p>
          ) : null}

          {/* 5. 社交链接（玻璃卡内、描述下方） */}
          {socialLinks.length > 0 ? (
            <div
              className="anime-onload flex flex-wrap justify-center gap-2"
              style={{ animationDelay: "520ms" }}
            >
              {socialLinks.map((link, i) => {
                const preset =
                  link.platform !== "custom"
                    ? SOCIAL_PLATFORMS[link.platform]
                    : null;
                const Icon = preset?.icon;
                const label = preset?.label ?? link.label ?? "";
                const href = resolveSocialHref(link.platform, link.url);
                return (
                  <a
                    key={`${link.platform}-${i}`}
                    href={href}
                    target={link.platform === "email" ? undefined : "_blank"}
                    rel={link.platform === "email" ? undefined : "noreferrer"}
                    aria-label={label}
                    className="fuwari-btn-regular h-10 w-10 rounded-full transition-colors hover:text-(--anime-sakura) active:scale-90"
                  >
                    {Icon ? (
                      <Icon size={20} strokeWidth={1.5} />
                    ) : (
                      <img src={link.icon} alt={label} className="h-5 w-5" />
                    )}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* 6. 进入按钮（卡片外、呼吸动画） */}
        <div className="anime-onload" style={{ animationDelay: "660ms" }}>
          <button
            type="button"
            onClick={() => navigate({ to: "/home" })}
            className="anime-breathe anime-btn-ripple rounded-full bg-(--fuwari-enter-btn-bg) px-10 py-3 text-lg font-medium text-(--fuwari-btn-content) transition-colors hover:bg-(--fuwari-enter-btn-bg-hover) active:bg-(--fuwari-enter-btn-bg-active) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--anime-sakura)"
          >
            {m.welcome_enter()}
          </button>
        </div>
      </div>
    </main>
  );
}
