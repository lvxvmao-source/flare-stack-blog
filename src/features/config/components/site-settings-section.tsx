import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AssetUploadField } from "@/features/config/components/asset-upload-field";
import { Field } from "@/features/config/components/site-settings-fields";
import { SocialLinksEditor } from "@/features/config/components/social-links-editor";
import { DefaultThemeSettings } from "@/features/config/components/themes/default-theme-settings";
import { FuwariThemeSettings } from "@/features/config/components/themes/fuwari-theme-settings";
import { AcgThemeSettings } from "@/features/config/components/themes/acg-theme-settings";
import type { SystemConfig } from "@/features/config/config.schema";
import { THEME_NAMES, type ThemeName } from "@/features/theme/theme-context";
import { m } from "@/paraglide/messages";

const themeLabels: Record<ThemeName, string> = {
  default: "Default",
  fuwari: "Fuwari",
  acg: "ACG",
};

function SectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border/30 bg-background/50 overflow-hidden">
      <div className="p-8 space-y-2 border-b border-border/20">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-8 grid gap-8 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function SiteSettingsSection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SystemConfig>();

  const getInputClassName = (error?: string) =>
    error ? "border-destructive focus-visible:border-destructive" : undefined;

  const activeThemeName = watch("site.themeName") ?? "default";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <SectionShell
        title={m.settings_site_section_basic_title()}
        description={m.settings_site_section_basic_desc()}
      >
        <Field
          label={m.settings_site_field_title()}
          hint={m.settings_site_field_title_hint()}
          error={errors.site?.title?.message}
        >
          <Input
            {...register("site.title")}
            className={getInputClassName(errors.site?.title?.message)}
            placeholder={m.settings_site_field_title_ph()}
          />
        </Field>
        <Field
          label={m.settings_site_field_author()}
          error={errors.site?.author?.message}
        >
          <Input
            {...register("site.author")}
            className={getInputClassName(errors.site?.author?.message)}
            placeholder={m.settings_site_field_author_ph()}
          />
        </Field>
        <Field
          label={m.settings_site_field_description()}
          hint={m.settings_site_field_description_hint()}
          error={errors.site?.description?.message}
        >
          <Textarea
            {...register("site.description")}
            className={getInputClassName(errors.site?.description?.message)}
            placeholder={m.settings_site_field_description_ph()}
          />
        </Field>
      </SectionShell>

      <SectionShell
        title={m.settings_site_section_social_title()}
        description={m.settings_site_section_social_desc()}
      >
        <div className="md:col-span-2">
          <SocialLinksEditor />
        </div>
      </SectionShell>

      <SectionShell
        title={m.settings_site_section_icons_title()}
        description={m.settings_site_section_icons_desc()}
      >
        <AssetUploadField
          name="site.icons.faviconSvg"
          assetPath="favicon/favicon.svg"
          accept=".svg"
          readOnly
          label={m.settings_site_field_favicon_svg()}
          error={errors.site?.icons?.faviconSvg?.message}
        />
        <AssetUploadField
          name="site.icons.faviconIco"
          assetPath="favicon/favicon.ico"
          accept=".ico"
          readOnly
          label={m.settings_site_field_favicon_ico()}
          error={errors.site?.icons?.faviconIco?.message}
        />
        <AssetUploadField
          name="site.icons.favicon96"
          assetPath="favicon/favicon-96x96.png"
          accept=".png"
          readOnly
          label={m.settings_site_field_favicon_96()}
          error={errors.site?.icons?.favicon96?.message}
        />
        <AssetUploadField
          name="site.icons.appleTouchIcon"
          assetPath="favicon/apple-touch-icon.png"
          accept=".png"
          readOnly
          label={m.settings_site_field_apple_touch_icon()}
          error={errors.site?.icons?.appleTouchIcon?.message}
        />
        <AssetUploadField
          name="site.icons.webApp192"
          assetPath="favicon/web-app-manifest-192x192.png"
          accept=".png,.webp"
          readOnly
          label={m.settings_site_field_web_app_192()}
          error={errors.site?.icons?.webApp192?.message}
        />
        <AssetUploadField
          name="site.icons.webApp512"
          assetPath="favicon/web-app-manifest-512x512.png"
          accept=".png,.webp"
          readOnly
          label={m.settings_site_field_web_app_512()}
          error={errors.site?.icons?.webApp512?.message}
        />
      </SectionShell>

      {/* Theme Section — active theme selector + expandable panels for all themes */}
      <SectionShell
        title={m.settings_site_section_theme_title()}
        description={m.settings_site_section_theme_desc()}
      >
        <div className="md:col-span-2 space-y-6">
          {/* Active Theme Selector */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              Active Theme
            </span>
            <select
              value={activeThemeName}
              onChange={(e) =>
                setValue("site.themeName", e.target.value as ThemeName, {
                  shouldDirty: true,
                })
              }
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            >
              {THEME_NAMES.map((name) => (
                <option key={name} value={name}>
                  {themeLabels[name]}
                </option>
              ))}
            </select>
          </div>

          {/* Default Theme Settings */}
          <details className="group border border-border/20 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/20 transition-colors list-none">
              <span className="text-sm font-medium text-foreground">
                Default Theme Settings
              </span>
              <span className="text-xs text-muted-foreground transition-transform group-open:rotate-90">
                ▶
              </span>
            </summary>
            <div className="p-6 border-t border-border/20">
              <DefaultThemeSettings />
            </div>
          </details>

          {/* Fuwari Theme Settings */}
          <details className="group border border-border/20 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/20 transition-colors list-none">
              <span className="text-sm font-medium text-foreground">
                Fuwari Theme Settings
              </span>
              <span className="text-xs text-muted-foreground transition-transform group-open:rotate-90">
                ▶
              </span>
            </summary>
            <div className="p-6 border-t border-border/20">
              <FuwariThemeSettings />
            </div>
          </details>

          {/* ACG Theme Settings */}
          <details className="group border border-border/20 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/20 transition-colors list-none">
              <span className="text-sm font-medium text-foreground">
                ACG Theme Settings
              </span>
              <span className="text-xs text-muted-foreground transition-transform group-open:rotate-90">
                ▶
              </span>
            </summary>
            <div className="p-6 border-t border-border/20">
              <AcgThemeSettings />
            </div>
          </details>
        </div>
      </SectionShell>
    </div>
  );
}
