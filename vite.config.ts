import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import packageJson from "./package.json";

const config = defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      strategy: ["cookie", "preferredLanguage", "baseLocale"],
      cookieName: "LOCALE",
      // Prevent the plugin from cleaning the output directory on startup.
      // The Cloudflare vite-plugin's workerd SSR runner resolves modules
      // during buildStart, and the clean→regenerate cycle creates a race
      // where files are missing when the runner tries to load them.
      // Pre-compiled files (from `npx @inlang/paraglide-js compile`) are
      // used as the initial state, and the plugin still recompiles on change.
      cleanOutdir: false,
    }),
    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
    }),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    devtools(),
    tanstackStart({
      importProtection: {
        enabled: false,
      },
    }),
    viteReact(),
  ],
});

export default config;
