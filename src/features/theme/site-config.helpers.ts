import type { SiteConfig, ThemeName } from "@/features/config/site-config.schema";

// if the theme doesn't have a preload image, return an empty array
export function getThemePreloadImages(
  siteConfig: SiteConfig,
  themeName: ThemeName,
): Array<string> {
  switch (themeName) {
    case "fuwari":
      return siteConfig.theme.fuwari.homeBg
        ? [siteConfig.theme.fuwari.homeBg]
        : [];
    case "acg":
      return [
        siteConfig.theme.acg.background?.homeImage,
        siteConfig.theme.acg.background?.globalImage,
      ].filter((image): image is string => Boolean(image));
    case "default":
      return [
        siteConfig.theme.default.background?.homeImage,
        siteConfig.theme.default.background?.globalImage,
      ].filter((image): image is string => Boolean(image));
    default:
      themeName satisfies never;
      return [];
  }
}
