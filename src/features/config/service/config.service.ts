import { blogConfig } from "@/blog.config";
import * as CacheService from "@/features/cache/cache.service";
import type { SiteConfig, SystemConfig } from "@/features/config/config.schema";
import {
  CONFIG_CACHE_KEYS,
  DEFAULT_CONFIG,
  SystemConfigSchema,
} from "@/features/config/config.schema";
import * as ConfigRepo from "@/features/config/data/config.data";
import { FullSiteConfigSchema } from "@/features/config/site-config.schema";
import type { SocialLink } from "@/features/config/utils/social-platforms";
import * as Storage from "@/features/media/data/media.storage";
import { purgeSiteCDNCache } from "@/lib/invalidate";

const DEFAULT_SMTP_PORT = 465;
const RESEND_SMTP_HOST = "smtp.resend.com";
const RESEND_SMTP_USERNAME = "resend";

function resolveEmailConfig(config: SystemConfig | null | undefined) {
  const email = config?.email;
  const legacyApiKey = email?.apiKey?.trim() || "";
  const password = email?.password?.trim() || legacyApiKey;
  const host = email?.host?.trim() || (legacyApiKey ? RESEND_SMTP_HOST : "");
  const username =
    email?.username?.trim() || (legacyApiKey ? RESEND_SMTP_USERNAME : "");

  return {
    host,
    port: email?.port ?? DEFAULT_SMTP_PORT,
    username,
    password,
    senderName: email?.senderName ?? "",
    senderAddress: email?.senderAddress ?? "",
  };
}

export function resolveSystemConfig(
  config: SystemConfig | null | undefined,
): SystemConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    email: resolveEmailConfig(config),
    notification: {
      ...DEFAULT_CONFIG.notification,
      ...config?.notification,
      admin: {
        ...DEFAULT_CONFIG.notification?.admin,
        ...config?.notification?.admin,
        channels: {
          ...DEFAULT_CONFIG.notification?.admin?.channels,
          ...config?.notification?.admin?.channels,
        },
      },
      user: {
        ...DEFAULT_CONFIG.notification?.user,
        ...config?.notification?.user,
      },
      webhooks:
        config?.notification?.webhooks ?? DEFAULT_CONFIG.notification?.webhooks,
    },
    site: resolveSiteConfig(config),
  };
}

function migrateSocial(social: unknown): SocialLink[] {
  // New format — already an array
  if (Array.isArray(social)) return social;

  // Old format — { github?: string, email?: string }
  if (social && typeof social === "object") {
    const old = social as { github?: string; email?: string };
    const migrated: SocialLink[] = [];
    if (old.github) migrated.push({ platform: "github", url: old.github });
    if (old.email)
      migrated.push({ platform: "email", url: `mailto:${old.email}` });
    return migrated;
  }

  // Fallback to blogConfig defaults
  return [...blogConfig.social];
}

export function resolveSiteConfig(
  config: SystemConfig | null | undefined,
): SiteConfig {
  const configDefaultBackground = config?.site?.theme?.default?.background;
  const configAcgBackground = config?.site?.theme?.acg?.background;

  return FullSiteConfigSchema.parse({
    title: config?.site?.title ?? blogConfig.title,
    author: config?.site?.author ?? blogConfig.author,
    description: config?.site?.description ?? blogConfig.description,
    social: migrateSocial(config?.site?.social),
    icons: {
      faviconSvg:
        config?.site?.icons?.faviconSvg || blogConfig.icons.faviconSvg,
      faviconIco:
        config?.site?.icons?.faviconIco || blogConfig.icons.faviconIco,
      favicon96: config?.site?.icons?.favicon96 || blogConfig.icons.favicon96,
      appleTouchIcon:
        config?.site?.icons?.appleTouchIcon || blogConfig.icons.appleTouchIcon,
      webApp192: config?.site?.icons?.webApp192 || blogConfig.icons.webApp192,
      webApp512: config?.site?.icons?.webApp512 || blogConfig.icons.webApp512,
    },
    theme: {
      default: {
        navBarName:
          config?.site?.theme?.default?.navBarName ??
          blogConfig.theme.default.navBarName,
        background: configDefaultBackground
          ? {
              homeImage: configDefaultBackground.homeImage ?? "",
              globalImage: configDefaultBackground.globalImage ?? "",
              light: {
                opacity: configDefaultBackground.light?.opacity ?? 0.15,
              },
              dark: {
                opacity: configDefaultBackground.dark?.opacity ?? 0.1,
              },
              backdropBlur: configDefaultBackground.backdropBlur ?? 8,
              transitionDuration:
                configDefaultBackground.transitionDuration ?? 600,
            }
          : undefined,
      },
      acg: {
        navBarName:
          config?.site?.theme?.acg?.navBarName ??
          blogConfig.theme.acg.navBarName,
        background: configAcgBackground
          ? {
              homeImage: configAcgBackground.homeImage ?? "",
              globalImage: configAcgBackground.globalImage ?? "",
              light: {
                opacity: configAcgBackground.light?.opacity ?? 0.15,
              },
              dark: {
                opacity: configAcgBackground.dark?.opacity ?? 0.1,
              },
              backdropBlur: configAcgBackground.backdropBlur ?? 8,
              transitionDuration:
                configAcgBackground.transitionDuration ?? 600,
            }
          : undefined,
      },
      fuwari: {
        homeBg:
          config?.site?.theme?.fuwari?.homeBg ?? blogConfig.theme.fuwari.homeBg,
        avatar:
          config?.site?.theme?.fuwari?.avatar ?? blogConfig.theme.fuwari.avatar,
        primaryHue:
          config?.site?.theme?.fuwari?.primaryHue ??
          blogConfig.theme.fuwari.primaryHue,
        sakuraEnabled:
          config?.site?.theme?.fuwari?.sakuraEnabled ??
          blogConfig.theme.fuwari.sakuraEnabled,
        sakuraDensity:
          config?.site?.theme?.fuwari?.sakuraDensity ??
          blogConfig.theme.fuwari.sakuraDensity,
        sakuraSpeed:
          config?.site?.theme?.fuwari?.sakuraSpeed ??
          blogConfig.theme.fuwari.sakuraSpeed,
        particlesEnabled:
          config?.site?.theme?.fuwari?.particlesEnabled ??
          blogConfig.theme.fuwari.particlesEnabled,
        bannerAnimationType:
          config?.site?.theme?.fuwari?.bannerAnimationType ??
          blogConfig.theme.fuwari.bannerAnimationType,
        postsBg:
          config?.site?.theme?.fuwari?.postsBg ??
          blogConfig.theme.fuwari.postsBg,
        postDetailBg:
          config?.site?.theme?.fuwari?.postDetailBg ??
          blogConfig.theme.fuwari.postDetailBg,
        searchBg:
          config?.site?.theme?.fuwari?.searchBg ??
          blogConfig.theme.fuwari.searchBg,
        friendLinksBg:
          config?.site?.theme?.fuwari?.friendLinksBg ??
          blogConfig.theme.fuwari.friendLinksBg,
        live2dEnabled:
          config?.site?.theme?.fuwari?.live2dEnabled ??
          blogConfig.theme.fuwari.live2dEnabled,
        live2dModel:
          config?.site?.theme?.fuwari?.live2dModel ??
          blogConfig.theme.fuwari.live2dModel,
        live2dPosition:
          config?.site?.theme?.fuwari?.live2dPosition ??
          blogConfig.theme.fuwari.live2dPosition,
        bgmEnabled:
          config?.site?.theme?.fuwari?.bgmEnabled ??
          blogConfig.theme.fuwari.bgmEnabled,
        bgmDefaultVolume:
          config?.site?.theme?.fuwari?.bgmDefaultVolume ??
          blogConfig.theme.fuwari.bgmDefaultVolume,
        bgmPlaylist:
          config?.site?.theme?.fuwari?.bgmPlaylist ??
          blogConfig.theme.fuwari.bgmPlaylist,
        commentStickersEnabled:
          config?.site?.theme?.fuwari?.commentStickersEnabled ??
          blogConfig.theme.fuwari.commentStickersEnabled,
        cardBorderRadius:
          config?.site?.theme?.fuwari?.cardBorderRadius ??
          blogConfig.theme.fuwari.cardBorderRadius,
        cardGlassIntensity:
          config?.site?.theme?.fuwari?.cardGlassIntensity ??
          blogConfig.theme.fuwari.cardGlassIntensity,
        footerQuote:
          config?.site?.theme?.fuwari?.footerQuote ??
          blogConfig.theme.fuwari.footerQuote,
        displayFont:
          config?.site?.theme?.fuwari?.displayFont ??
          blogConfig.theme.fuwari.displayFont,
      },
    },
    navItems: config?.site?.navItems ?? blogConfig.navItems,
    themeName: config?.site?.themeName ?? blogConfig.themeName,
  });
}

function hasSiteConfigChanged(
  currentConfig: SystemConfig | null | undefined,
  nextConfig: SystemConfig | null | undefined,
) {
  return (
    JSON.stringify(resolveSiteConfig(currentConfig)) !==
    JSON.stringify(resolveSiteConfig(nextConfig))
  );
}

export async function getSystemConfig(
  context: DbContext & { executionCtx: ExecutionContext },
) {
  const config = await CacheService.get(
    context,
    CONFIG_CACHE_KEYS.system,
    SystemConfigSchema,
    async () =>
      resolveSystemConfig(await ConfigRepo.getSystemConfig(context.db)),
  );

  const normalizedConfig = resolveSystemConfig(config);

  if (JSON.stringify(config) !== JSON.stringify(normalizedConfig)) {
    context.executionCtx.waitUntil(
      CacheService.set(
        context,
        CONFIG_CACHE_KEYS.system,
        JSON.stringify(normalizedConfig),
        { ttl: "1h" },
      ),
    );
  }

  return normalizedConfig;
}

export async function getSiteConfig(
  context: DbContext & { executionCtx: ExecutionContext },
) {
  const config = await getSystemConfig(context);
  return resolveSiteConfig(config);
}

export async function updateSystemConfig(
  context: DbContext & { executionCtx: ExecutionContext },
  data: SystemConfig,
) {
  const currentConfig = await ConfigRepo.getSystemConfig(context.db);
  const nextConfig = resolveSystemConfig(data);

  await ConfigRepo.upsertSystemConfig(context.db, nextConfig);
  await CacheService.deleteKey(context, CONFIG_CACHE_KEYS.system);

  if (hasSiteConfigChanged(currentConfig, nextConfig)) {
    await purgeSiteCDNCache(context.env);
  }

  return { success: true };
}

export async function uploadSiteAsset(
  context: { env: Env },
  input: { file: File; assetPath: string },
): Promise<{ url: string }> {
  const { url } = await Storage.putSiteAsset(
    context.env,
    input.file,
    input.assetPath,
  );

  const timestamp = Math.floor(Date.now() / 1000);
  const isFavicon = input.assetPath.startsWith("favicon/");
  const finalUrl = isFavicon
    ? `${url}?original=true&v=${timestamp}`
    : `${url}?v=${timestamp}`;

  return { url: finalUrl };
}
