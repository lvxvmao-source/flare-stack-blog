import type { SiteConfig } from "@/features/config/site-config.schema";

export const blogConfig = {
  title: "站点名称",
  author: "作者",
  description:
    "这是我的个人网站和博客。在这里，我主要分享与技术和生活相关的内容。欢迎阅读！",
  social: [
    { platform: "github", url: "https://github.com/example" },
    { platform: "email", url: "mailto:example@email.com" },
    { platform: "rss", url: "/rss.xml" },
  ],
  icons: {
    faviconSvg: "/favicon.svg",
    faviconIco: "/favicon.ico",
    favicon96: "/favicon-96x96.png",
    appleTouchIcon: "/apple-touch-icon.png",
    webApp192: "/web-app-manifest-192x192.png",
    webApp512: "/web-app-manifest-512x512.png",
  },
  theme: {
    default: {
      navBarName: "导航栏名称",
    },
    fuwari: {
      homeBg: "/images/home-bg.webp",
      avatar: "/images/avatar.png",
      primaryHue: 350,
      sakuraEnabled: true,
      sakuraDensity: 5,
      sakuraSpeed: 3,
      particlesEnabled: true,
      bannerAnimationType: "fade",
      postsBg: "",
      friendLinksBg: "",
      live2dEnabled: true,
      live2dModel: "miku",
      live2dPosition: "right",
      live2dCustomModelUrl: "",
      bgmEnabled: false,
      bgmDefaultVolume: 30,
      bgmPlaylist: [],
      commentStickersEnabled: true,
      cardBorderRadius: 1.25,
      cardGlassIntensity: 0.65,
      footerQuote: "愿你在二次元的世界里，找到属于自己的那片星空 ✨",
      displayFont: "zcool",
      welcome: {
        background: "",
      },
    },
    acg: {
      navBarName: "导航栏名称",
    },
  },
  themeName: "default" as const,
  navItems: [],
} as const satisfies SiteConfig;
