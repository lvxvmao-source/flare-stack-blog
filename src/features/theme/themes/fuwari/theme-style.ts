import type { CSSProperties } from "react";
import type { SiteConfig } from "@/features/config/site-config.schema";

export function getFuwariThemeStyle(siteConfig: SiteConfig): CSSProperties {
  const fuwari = siteConfig.theme.fuwari;
  return {
    "--fuwari-hue": String(fuwari.primaryHue),
    "--anime-radius": `${fuwari.cardBorderRadius}rem`,
    "--anime-glass-bg": `oklch(1 0 0 / ${fuwari.cardGlassIntensity})`,
    "--anime-glass-blur": `${8 + fuwari.cardGlassIntensity * 8}px`,
    "--anime-radius-sm": `${Math.max(0.5, fuwari.cardBorderRadius - 0.5)}rem`,
    "--anime-radius-lg": `${Math.min(2, fuwari.cardBorderRadius + 0.25)}rem`,
  } as CSSProperties;
}
