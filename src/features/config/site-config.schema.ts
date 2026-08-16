import { z } from "zod";
import type { Messages } from "@/lib/i18n";
import { SOCIAL_PLATFORM_KEYS } from "./utils/social-platforms";

export const SocialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORM_KEYS),
  url: z.string(),
  icon: z.string().optional(),
  label: z.string().optional(),
});

export function createNavItemSchema(messages?: Messages) {
  const safeMessages = messages as
    | Partial<Record<string, (...args: unknown[]) => string>>
    | undefined;
  const invalidLinkMessage =
    safeMessages?.settings_nav_validation_invalid_link?.() ??
    "站内链接需以 / 开头，外部链接需为合法 http(s) URL";

  return z
    .object({
      id: z.string().min(1),
      label: z.object({
        zh: z.string().trim().max(60),
        en: z.string().trim().max(60),
      }),
      description: z
        .object({
          zh: z.string().trim().max(200),
          en: z.string().trim().max(200),
        })
        .optional(),
      type: z.enum(["internal", "external"]),
      to: z.string().min(1),
      openInNewTab: z.boolean().optional(),
      banner: z.string().optional(),
    })
    .refine(
      (item) =>
        item.type === "internal"
          ? item.to.startsWith("/")
          : /^https?:\/\//i.test(item.to),
      { message: invalidLinkMessage, path: ["to"] },
    );
}

export const NavItemSchema = createNavItemSchema();
export type NavItem = z.infer<typeof NavItemSchema>;

export const DEFAULT_THEME_OPACITY_MIN = 0;
export const DEFAULT_THEME_OPACITY_MAX = 0.4;
export const DEFAULT_THEME_BLUR_MIN = 0;
export const DEFAULT_THEME_BLUR_MAX = 32;
export const DEFAULT_THEME_TRANSITION_MIN = 0;
export const DEFAULT_THEME_TRANSITION_MAX = 1500;
export const FUWARI_THEME_HUE_MIN = 0;
export const FUWARI_THEME_HUE_MAX = 360;

function createSiteTextSchema(max: number) {
  return z.string().trim().max(max);
}

function createSiteTextFormSchema(max: number, messages: Messages) {
  return z
    .string()
    .trim()
    .max(max, messages.settings_site_validation_too_long({ max }));
}

function createAssetRefSchema() {
  return z.string().refine((value) => value === "" || value.startsWith("/"), {
    message: "Please enter a root-relative path",
  });
}

function createAssetRefFormSchema(messages: Messages) {
  return z.string().refine((value) => value === "" || value.startsWith("/"), {
    message: messages.settings_site_validation_invalid_asset_ref(),
  });
}

function isExternalImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createBackgroundImageRefSchema() {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || value.startsWith("/") || isExternalImageUrl(value),
      {
        message: "Please enter a root-relative path or http(s) URL",
      },
    );
}

function createBackgroundImageRefFormSchema(messages: Messages) {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || value.startsWith("/") || isExternalImageUrl(value),
      {
        message:
          messages.settings_site_validation_invalid_background_image_ref(),
      },
    );
}

function createAssetPathSchema() {
  return z.string().refine((value) => value.startsWith("/"), {
    message: "Please enter a root-relative path",
  });
}

function createAssetPathFormSchema(messages: Messages) {
  return z.string().refine((value) => value.startsWith("/"), {
    message: messages.settings_site_validation_invalid_asset_path(),
  });
}

function createOptionalAssetPathSchema() {
  return z.union([createAssetPathSchema(), z.literal("")]);
}

function createOptionalAssetPathFormSchema(messages: Messages) {
  return z.union([createAssetPathFormSchema(messages), z.literal("")]);
}

function createOpacitySchema() {
  return z
    .number()
    .min(DEFAULT_THEME_OPACITY_MIN)
    .max(DEFAULT_THEME_OPACITY_MAX, {
      message: `Value must be between ${DEFAULT_THEME_OPACITY_MIN} and ${DEFAULT_THEME_OPACITY_MAX}`,
    });
}

function createOpacityFormSchema(messages: Messages) {
  return z
    .number()
    .min(DEFAULT_THEME_OPACITY_MIN)
    .max(DEFAULT_THEME_OPACITY_MAX, {
      message: messages.settings_site_validation_opacity_range(),
    });
}

function createBlurSchema() {
  return z
    .number()
    .int()
    .min(DEFAULT_THEME_BLUR_MIN)
    .max(DEFAULT_THEME_BLUR_MAX, {
      message: `Value must be between ${DEFAULT_THEME_BLUR_MIN} and ${DEFAULT_THEME_BLUR_MAX}`,
    });
}

function createBlurFormSchema(messages: Messages) {
  return z
    .number()
    .int()
    .min(DEFAULT_THEME_BLUR_MIN)
    .max(DEFAULT_THEME_BLUR_MAX, {
      message: messages.settings_site_validation_blur_range(),
    });
}

function createTransitionDurationSchema() {
  return z
    .number()
    .int()
    .min(DEFAULT_THEME_TRANSITION_MIN)
    .max(DEFAULT_THEME_TRANSITION_MAX, {
      message: `Value must be between ${DEFAULT_THEME_TRANSITION_MIN} and ${DEFAULT_THEME_TRANSITION_MAX}`,
    });
}

function createTransitionDurationFormSchema(messages: Messages) {
  return z
    .number()
    .int()
    .min(DEFAULT_THEME_TRANSITION_MIN)
    .max(DEFAULT_THEME_TRANSITION_MAX, {
      message: messages.settings_site_validation_transition_range(),
    });
}

function createHueSchema() {
  return z
    .number()
    .int()
    .min(FUWARI_THEME_HUE_MIN)
    .max(FUWARI_THEME_HUE_MAX, {
      message: `Value must be between ${FUWARI_THEME_HUE_MIN} and ${FUWARI_THEME_HUE_MAX}`,
    });
}

function createHueFormSchema(messages: Messages) {
  return z.number().int().min(FUWARI_THEME_HUE_MIN).max(FUWARI_THEME_HUE_MAX, {
    message: messages.settings_site_validation_hue_range(),
  });
}

function createDefaultThemeBackgroundSchema() {
  return z.object({
    homeImage: createBackgroundImageRefSchema(),
    globalImage: createBackgroundImageRefSchema(),
    light: z.object({
      opacity: createOpacitySchema(),
    }),
    dark: z.object({
      opacity: createOpacitySchema(),
    }),
    backdropBlur: createBlurSchema(),
    transitionDuration: createTransitionDurationSchema(),
  });
}

function createDefaultThemeBackgroundInputSchema() {
  return z.object({
    homeImage: createBackgroundImageRefSchema().optional(),
    globalImage: createBackgroundImageRefSchema().optional(),
    light: z
      .object({
        opacity: createOpacitySchema().optional(),
      })
      .optional(),
    dark: z
      .object({
        opacity: createOpacitySchema().optional(),
      })
      .optional(),
    backdropBlur: createBlurSchema().optional(),
    transitionDuration: createTransitionDurationSchema().optional(),
  });
}

function createDefaultThemeBackgroundInputFormSchema(messages: Messages) {
  return z.object({
    homeImage: createBackgroundImageRefFormSchema(messages).optional(),
    globalImage: createBackgroundImageRefFormSchema(messages).optional(),
    light: z
      .object({
        opacity: createOpacityFormSchema(messages).optional(),
      })
      .optional(),
    dark: z
      .object({
        opacity: createOpacityFormSchema(messages).optional(),
      })
      .optional(),
    backdropBlur: createBlurFormSchema(messages).optional(),
    transitionDuration: createTransitionDurationFormSchema(messages).optional(),
  });
}

function createDefaultThemeSiteConfigSchema() {
  return z.object({
    navBarName: createSiteTextSchema(60),
    background: createDefaultThemeBackgroundSchema().optional(),
  });
}

function createDefaultThemeSiteConfigInputSchema() {
  return z.object({
    navBarName: createSiteTextSchema(60).optional(),
    background: createDefaultThemeBackgroundInputSchema().optional(),
  });
}

function createDefaultThemeSiteConfigInputFormSchema(messages: Messages) {
  return z.object({
    navBarName: createSiteTextFormSchema(60, messages).optional(),
    background:
      createDefaultThemeBackgroundInputFormSchema(messages).optional(),
  });
}

function createAcgThemeSiteConfigSchema() {
  return z.object({
    navBarName: createSiteTextSchema(60),
    background: createDefaultThemeBackgroundSchema().optional(),
  });
}

function createAcgThemeSiteConfigInputSchema() {
  return z.object({
    navBarName: createSiteTextSchema(60).optional(),
    background: createDefaultThemeBackgroundInputSchema().optional(),
  });
}

function createAcgThemeSiteConfigInputFormSchema(messages: Messages) {
  return z.object({
    navBarName: createSiteTextFormSchema(60, messages).optional(),
    background:
      createDefaultThemeBackgroundInputFormSchema(messages).optional(),
  });
}

function createBgmTrackSchema() {
  return z.object({
    title: z.string().min(1).max(200),
    url: z.string().min(1),
  });
}

function createFuwariThemeSiteConfigSchema() {
  return z.object({
    homeBg: createBackgroundImageRefSchema(),
    avatar: createAssetRefSchema(),
    primaryHue: createHueSchema(),
    // Decoration effects
    sakuraEnabled: z.boolean(),
    sakuraDensity: z.number().int().min(1).max(10),
    sakuraSpeed: z.number().int().min(1).max(5),
    particlesEnabled: z.boolean(),
    bannerAnimationType: z.enum(["fade", "parallax", "kenburns", "none"]),
    // Page-specific backgrounds
    postsBg: createBackgroundImageRefSchema(),
    friendLinksBg: createBackgroundImageRefSchema(),
    // Live2D widget
    live2dEnabled: z.boolean(),
    live2dModel: z.enum(["haru", "hijiki", "tororo", "shizuku", "custom"]),
    live2dPosition: z.enum(["left", "right"]),
    live2dCustomModelUrl: z.string().max(2000).default(""),
    // BGM player
    bgmEnabled: z.boolean(),
    bgmDefaultVolume: z.number().int().min(0).max(100),
    bgmPlaylist: z.array(createBgmTrackSchema()),
    // Comment stickers
    commentStickersEnabled: z.boolean(),
    // Card style
    cardBorderRadius: z.number().min(0.5).max(2),
    cardGlassIntensity: z.number().min(0).max(1),
    // Footer
    footerQuote: z.string().max(200),
    // Font
    displayFont: z.enum(["zcool", "mashan", "noto"]),
    // Welcome page background (image or .mp4/.webm video URL)
    welcome: z
      .object({
        background: z.string(),
      })
      .default({ background: "" }),
  });
}

function createFuwariThemeSiteConfigInputSchema() {
  return z.object({
    homeBg: createBackgroundImageRefSchema().optional(),
    avatar: createAssetRefSchema().optional(),
    primaryHue: createHueSchema().optional(),
    sakuraEnabled: z.boolean().optional(),
    sakuraDensity: z.number().int().min(1).max(10).optional(),
    sakuraSpeed: z.number().int().min(1).max(5).optional(),
    particlesEnabled: z.boolean().optional(),
    bannerAnimationType: z
      .enum(["fade", "parallax", "kenburns", "none"])
      .optional(),
    postsBg: createBackgroundImageRefSchema().optional(),
    friendLinksBg: createBackgroundImageRefSchema().optional(),
    live2dEnabled: z.boolean().optional(),
    live2dModel: z
      .enum(["haru", "hijiki", "tororo", "shizuku", "custom"])
      .optional(),
    live2dPosition: z.enum(["left", "right"]).optional(),
    live2dCustomModelUrl: z.string().max(2000).optional(),
    bgmEnabled: z.boolean().optional(),
    bgmDefaultVolume: z.number().int().min(0).max(100).optional(),
    bgmPlaylist: z.array(createBgmTrackSchema()).optional(),
    commentStickersEnabled: z.boolean().optional(),
    cardBorderRadius: z.number().min(0.5).max(2).optional(),
    cardGlassIntensity: z.number().min(0).max(1).optional(),
    footerQuote: z.string().max(200).optional(),
    displayFont: z.enum(["zcool", "mashan", "noto"]).optional(),
    welcome: z
      .object({
        background: z.string().max(2000),
      })
      .optional(),
  });
}

function createFuwariThemeSiteConfigInputFormSchema(messages: Messages) {
  return z.object({
    homeBg: createBackgroundImageRefFormSchema(messages).optional(),
    avatar: createAssetRefFormSchema(messages).optional(),
    primaryHue: createHueFormSchema(messages).optional(),
    sakuraEnabled: z.boolean().optional(),
    sakuraDensity: z.number().int().min(1).max(10).optional(),
    sakuraSpeed: z.number().int().min(1).max(5).optional(),
    particlesEnabled: z.boolean().optional(),
    bannerAnimationType: z
      .enum(["fade", "parallax", "kenburns", "none"])
      .optional(),
    postsBg: createBackgroundImageRefFormSchema(messages).optional(),
    friendLinksBg: createBackgroundImageRefFormSchema(messages).optional(),
    live2dEnabled: z.boolean().optional(),
    live2dModel: z
      .enum(["haru", "hijiki", "tororo", "shizuku", "custom"])
      .optional(),
    live2dPosition: z.enum(["left", "right"]).optional(),
    live2dCustomModelUrl: z.string().max(2000).optional(),
    bgmEnabled: z.boolean().optional(),
    bgmDefaultVolume: z.number().int().min(0).max(100).optional(),
    bgmPlaylist: z.array(createBgmTrackSchema()).optional(),
    commentStickersEnabled: z.boolean().optional(),
    cardBorderRadius: z.number().min(0.5).max(2).optional(),
    cardGlassIntensity: z.number().min(0).max(1).optional(),
    footerQuote: z.string().max(200).optional(),
    displayFont: z.enum(["zcool", "mashan", "noto"]).optional(),
    welcome: z
      .object({
        background: z.string().max(2000),
      })
      .optional(),
  });
}

export const defaultThemeBackgroundSchema =
  createDefaultThemeBackgroundSchema();
export const defaultThemeBackgroundInputSchema =
  createDefaultThemeBackgroundInputSchema();
export const defaultThemeSiteConfigSchema =
  createDefaultThemeSiteConfigSchema();
export const defaultThemeSiteConfigInputSchema =
  createDefaultThemeSiteConfigInputSchema();
export const acgThemeSiteConfigSchema = createAcgThemeSiteConfigSchema();
export const acgThemeSiteConfigInputSchema =
  createAcgThemeSiteConfigInputSchema();
export const fuwariThemeSiteConfigSchema = createFuwariThemeSiteConfigSchema();
export const fuwariThemeSiteConfigInputSchema =
  createFuwariThemeSiteConfigInputSchema();

export const themeNameEnum = z.enum(["default", "fuwari", "acg"]);
export type ThemeName = z.infer<typeof themeNameEnum>;

export const FullSiteConfigSchema = z.object({
  title: createSiteTextSchema(120),
  author: createSiteTextSchema(80),
  description: createSiteTextSchema(300),
  social: z.array(SocialLinkSchema),
  icons: z.object({
    faviconSvg: createAssetPathSchema(),
    faviconIco: createAssetPathSchema(),
    favicon96: createAssetPathSchema(),
    appleTouchIcon: createAssetPathSchema(),
    webApp192: createAssetPathSchema(),
    webApp512: createAssetPathSchema(),
  }),
  theme: z.object({
    default: defaultThemeSiteConfigSchema,
    fuwari: fuwariThemeSiteConfigSchema,
    acg: acgThemeSiteConfigSchema,
  }),
  themeName: themeNameEnum.default("default"),
  navItems: z.array(NavItemSchema).optional(),
});

export function createSiteConfigInputFormSchema(messages: Messages) {
  return z.object({
    title: createSiteTextFormSchema(120, messages).optional(),
    author: createSiteTextFormSchema(80, messages).optional(),
    description: createSiteTextFormSchema(300, messages).optional(),
    social: z.array(SocialLinkSchema).optional(),
    icons: z
      .object({
        faviconSvg: createOptionalAssetPathFormSchema(messages).optional(),
        faviconIco: createOptionalAssetPathFormSchema(messages).optional(),
        favicon96: createOptionalAssetPathFormSchema(messages).optional(),
        appleTouchIcon: createOptionalAssetPathFormSchema(messages).optional(),
        webApp192: createOptionalAssetPathFormSchema(messages).optional(),
        webApp512: createOptionalAssetPathFormSchema(messages).optional(),
      })
      .optional(),
    theme: z
      .object({
        default:
          createDefaultThemeSiteConfigInputFormSchema(messages).optional(),
        fuwari: createFuwariThemeSiteConfigInputFormSchema(messages).optional(),
        acg: createAcgThemeSiteConfigInputFormSchema(messages).optional(),
      })
      .optional(),
    themeName: themeNameEnum.optional(),
    navItems: z.array(createNavItemSchema(messages)).optional(),
  });
}

export const SiteConfigInputSchema = z.object({
  title: createSiteTextSchema(120).optional(),
  author: createSiteTextSchema(80).optional(),
  description: createSiteTextSchema(300).optional(),
  social: z.array(SocialLinkSchema).optional(),
  icons: z
    .object({
      faviconSvg: createOptionalAssetPathSchema().optional(),
      faviconIco: createOptionalAssetPathSchema().optional(),
      favicon96: createOptionalAssetPathSchema().optional(),
      appleTouchIcon: createOptionalAssetPathSchema().optional(),
      webApp192: createOptionalAssetPathSchema().optional(),
      webApp512: createOptionalAssetPathSchema().optional(),
    })
    .optional(),
  theme: z
    .object({
      default: defaultThemeSiteConfigInputSchema.optional(),
      fuwari: fuwariThemeSiteConfigInputSchema.optional(),
      acg: acgThemeSiteConfigInputSchema.optional(),
    })
    .optional(),
  themeName: themeNameEnum.optional(),
  navItems: z.array(NavItemSchema).optional(),
});

export const SiteConfigSchema = SiteConfigInputSchema;

export type DefaultThemeSiteConfig = z.infer<
  typeof defaultThemeSiteConfigSchema
>;
export type DefaultThemeBackground = z.infer<
  typeof defaultThemeBackgroundSchema
>;
export type DefaultThemeSiteConfigInput = z.infer<
  typeof defaultThemeSiteConfigInputSchema
>;
export type AcgThemeSiteConfig = z.infer<typeof acgThemeSiteConfigSchema>;
export type AcgThemeSiteConfigInput = z.infer<
  typeof acgThemeSiteConfigInputSchema
>;
export type FuwariThemeSiteConfig = z.infer<typeof fuwariThemeSiteConfigSchema>;
export type FuwariThemeSiteConfigInput = z.infer<
  typeof fuwariThemeSiteConfigInputSchema
>;
export type SiteConfig = z.infer<typeof FullSiteConfigSchema>;
export type SiteConfigInput = z.infer<typeof SiteConfigInputSchema>;
