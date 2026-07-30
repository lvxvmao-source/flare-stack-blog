import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import defaultTheme from "@/features/theme/themes/default";
import fuwariTheme from "@/features/theme/themes/fuwari";
import acgTheme from "@/features/theme/themes/acg";
import type { ThemeComponents } from "@/features/theme/contract/components";

export type ThemeName = "default" | "fuwari" | "acg";

export const THEME_NAMES: ThemeName[] = ["default", "fuwari", "acg"];

export const themeMap: Record<ThemeName, ThemeComponents> = {
  default: defaultTheme,
  fuwari: fuwariTheme,
  acg: acgTheme,
};

const themeCSSImports: Record<ThemeName, () => Promise<void>> = {
  default: async () => {
    await import("./themes/default/styles/index.css");
  },
  fuwari: async () => {
    await import("./themes/fuwari/styles/index.css");
  },
  acg: async () => {
    await import("./themes/acg/styles/index.css");
  },
};

export const themeHomeConfigs = {
  default: defaultTheme.config.home,
  fuwari: fuwariTheme.config.home,
  acg: acgTheme.config.home,
};

export const themePostsConfigs = {
  default: defaultTheme.config.posts,
  fuwari: fuwariTheme.config.posts,
  acg: acgTheme.config.posts,
};

const ThemeContext = createContext<ThemeComponents>(defaultTheme);
ThemeContext.displayName = "ThemeContext";

export function SiteThemeProvider({
  themeName,
  children,
}: {
  themeName: ThemeName;
  children: ReactNode;
}) {
  const prevThemeRef = useRef<ThemeName | null>(null);

  const theme = themeMap[themeName] || defaultTheme;

  // Dynamically load theme CSS on mount and when theme changes
  useEffect(() => {
    if (prevThemeRef.current === themeName) return;
    prevThemeRef.current = themeName;

    const loadCSS = themeCSSImports[themeName];
    if (loadCSS) {
      loadCSS().catch((err) => {
        console.error(`Failed to load CSS for theme "${themeName}":`, err);
      });
    }
  }, [themeName]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useSiteTheme(): ThemeComponents {
  return useContext(ThemeContext);
}
