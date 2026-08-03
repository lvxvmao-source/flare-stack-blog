import "@/features/theme/themes/fuwari/styles/preview.css";
import { useFormContext, useWatch } from "react-hook-form";
import { AssetUploadField } from "@/features/config/components/asset-upload-field";
import { RangeField } from "@/features/config/components/site-settings-fields";
import type { SystemConfig } from "@/features/config/config.schema";
import {
  FUWARI_THEME_HUE_MAX,
  FUWARI_THEME_HUE_MIN,
} from "@/features/config/site-config.schema";
import { m } from "@/paraglide/messages";

function FuwariHuePreview() {
  const { control } = useFormContext<SystemConfig>();
  const currentHue = useWatch({
    control,
    name: "site.theme.fuwari.primaryHue",
  });
  const previewHue =
    typeof currentHue === "number" && !Number.isNaN(currentHue)
      ? currentHue
      : 250;

  const previewStyle = {
    "--fuwari-hue": String(previewHue),
  } as React.CSSProperties;

  return (
    <div
      className="fuwari-preview rounded-2xl border border-border/40 bg-background/70 p-4 md:col-span-2"
      style={previewStyle}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            {m.settings_site_primary_preview_title()}
          </p>
          <p className="text-xs text-muted-foreground">
            {m.settings_site_primary_preview_desc({ hue: String(previewHue) })}
          </p>
        </div>
        <div
          className="h-10 w-10 shrink-0 rounded-xl border border-black/10 shadow-sm"
          style={{ backgroundColor: "var(--fuwari-primary)" }}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="fuwari-card-base rounded-xl border border-black/5 p-4 shadow-sm">
          <div
            className="h-2.5 w-16 rounded-full"
            style={{ backgroundColor: "var(--fuwari-primary)" }}
          />
          <p className="mt-4 text-xs/5 font-medium text-black/45 dark:text-white/45">
            {m.settings_site_primary_preview_card_label()}
          </p>
          <p className="mt-1 text-lg font-semibold text-black/90 dark:text-white/90">
            {m.settings_site_primary_preview_card_title()}
          </p>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            {m.settings_site_primary_preview_card_desc()}
          </p>
        </div>

        <button
          type="button"
          className="fuwari-btn-primary h-11 rounded-xl px-4 text-sm font-semibold shadow-sm active:scale-[0.98]"
        >
          {m.settings_site_primary_preview_btn_primary()}
        </button>

        <button
          type="button"
          className="fuwari-btn-regular h-11 rounded-xl px-4 text-sm font-medium shadow-sm active:scale-[0.98]"
        >
          {m.settings_site_primary_preview_btn_tinted()}
        </button>
      </div>
    </div>
  );
}

/* ─── Simple section shell for settings blocks ─── */
function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/60 p-5 space-y-4">
      <h4 className="text-sm font-semibold text-foreground border-b border-border/30 pb-2">{title}</h4>
      {children}
    </div>
  );
}

/* ─── Toggle field helper ─── */
function ToggleField({
  name,
  label,
  hint,
}: {
  name: string;
  label: string;
  hint?: string;
}) {
  const { register, formState: { errors } } = useFormContext<SystemConfig>();
  const err = errors as Record<string, unknown>;
  const errMsg = name.split(".").reduce((obj: Record<string, unknown>, key) => obj?.[key] as Record<string, unknown>, err)?.message as string | undefined;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label className="text-sm font-medium">{label}</label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          {...register(name as keyof SystemConfig)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-(--fuwari-primary)/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-(--fuwari-primary)" />
      </label>
      {errMsg && <p className="text-xs text-red-500">{errMsg}</p>}
    </div>
  );
}

/* ─── Select field helper ─── */
function SelectField({
  name,
  label,
  options,
  hint,
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}) {
  const { register } = useFormContext<SystemConfig>();
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1">{hint}</p>}
      <select
        {...register(name as keyof SystemConfig)}
        className="mt-1 w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--fuwari-primary)/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ─── Text input field helper ─── */
function TextField({
  name,
  label,
  placeholder,
  hint,
}: {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
}) {
  const { register } = useFormContext<SystemConfig>();
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1">{hint}</p>}
      <input
        type="text"
        {...register(name as keyof SystemConfig)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--fuwari-primary)/30"
      />
    </div>
  );
}

/* ─── BGM playlist editor ─── */
function BgmPlaylistEditor() {
  const { register, watch, setValue } = useFormContext<SystemConfig>();
  const playlist = watch("site.theme.fuwari.bgmPlaylist") as Array<{ title: string; url: string }> | undefined;
  const tracks = playlist ?? [];

  const addTrack = () => {
    setValue("site.theme.fuwari.bgmPlaylist", [...tracks, { title: "", url: "" }] as never);
  };

  const removeTrack = (index: number) => {
    setValue("site.theme.fuwari.bgmPlaylist", tracks.filter((_, i) => i !== index) as never);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{m.settings_site_fuwari_bgm_playlist?.() ?? "BGM Playlist"}</label>
      {tracks.map((_, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input
            type="text"
            {...register(`site.theme.fuwari.bgmPlaylist.${i}.title` as never)}
            placeholder="Track title"
            className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--fuwari-primary)/30"
          />
          <input
            type="text"
            {...register(`site.theme.fuwari.bgmPlaylist.${i}.url` as never)}
            placeholder="Audio URL or Bilibili video link"
            className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--fuwari-primary)/30"
          />
          <button type="button" onClick={() => removeTrack(i)} className="text-red-500 text-xs px-2 py-2 hover:bg-red-50 rounded-lg transition-colors">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={addTrack} className="text-xs text-(--fuwari-primary) hover:underline font-medium">
        + {m.settings_site_fuwari_bgm_add_track?.() ?? "Add track"}
      </button>
    </div>
  );
}

export function FuwariThemeSettings() {
  const {
    formState: { errors },
  } = useFormContext<SystemConfig>();

  return (
    <>
      {/* ── Basic ── */}
      <AssetUploadField
        name="site.theme.fuwari.homeBg"
        assetPath="themes/fuwari/home-bg.webp"
        accept=".png,.webp,.jpg,.jpeg"
        label={m.settings_site_field_home_image()}
        hint={m.settings_site_field_home_image_hint()}
        placeholder="/images/asset/themes/fuwari/home-bg.webp or https://picsum.photos/1600/900"
        error={errors.site?.theme?.fuwari?.homeBg?.message}
      />
      <AssetUploadField
        name="site.theme.fuwari.avatar"
        assetPath="themes/fuwari/avatar.png"
        accept=".png,.webp,.jpg,.jpeg"
        readOnly
        label={m.settings_site_field_avatar()}
        error={errors.site?.theme?.fuwari?.avatar?.message}
      />
      <RangeField
        name="site.theme.fuwari.primaryHue"
        label={m.settings_site_field_primary_hue()}
        hint={m.settings_site_field_primary_hue_hint()}
        min={FUWARI_THEME_HUE_MIN}
        max={FUWARI_THEME_HUE_MAX}
        step={1}
        unit="deg"
        defaultValue={250}
        error={errors.site?.theme?.fuwari?.primaryHue?.message}
      />
      <FuwariHuePreview />

      {/* ── Decoration Effects ── */}
      <SectionShell title={m.settings_site_fuwari_effects?.() ?? "Decoration Effects"}>
        <ToggleField name="site.theme.fuwari.sakuraEnabled" label={m.settings_site_fuwari_sakura_enabled?.() ?? "Sakura Petal Effect"} hint={m.settings_site_fuwari_sakura_hint?.() ?? "Falling cherry blossom petals across the page"} />
        <RangeField name="site.theme.fuwari.sakuraDensity" label={m.settings_site_fuwari_sakura_density?.() ?? "Petal Density"} min={1} max={10} step={1} defaultValue={5} />
        <RangeField name="site.theme.fuwari.sakuraSpeed" label={m.settings_site_fuwari_sakura_speed?.() ?? "Fall Speed"} min={1} max={5} step={1} defaultValue={3} />
        <ToggleField name="site.theme.fuwari.particlesEnabled" label={m.settings_site_fuwari_particles?.() ?? "Particle Effects"} hint={m.settings_site_fuwari_particles_hint?.() ?? "Subtle sparkle particles on the page"} />
        <SelectField name="site.theme.fuwari.bannerAnimationType" label={m.settings_site_fuwari_banner_anim?.() ?? "Banner Animation"} options={[
          { value: "fade", label: "Fade" },
          { value: "parallax", label: "Parallax" },
          { value: "kenburns", label: "Ken Burns" },
          { value: "none", label: "None" },
        ]} />
      </SectionShell>

      {/* ── Page Backgrounds ── */}
      <SectionShell title={m.settings_site_fuwari_page_bgs?.() ?? "Page Backgrounds"}>
        <AssetUploadField name="site.theme.fuwari.postsBg" assetPath="themes/fuwari/posts-bg.webp" accept=".png,.webp,.jpg,.jpeg" label={m.settings_site_fuwari_posts_bg?.() ?? "Posts Page Banner"} placeholder="Leave empty to use default home background" error={errors.site?.theme?.fuwari?.postsBg?.message} />
        <AssetUploadField name="site.theme.fuwari.friendLinksBg" assetPath="themes/fuwari/friend-links-bg.webp" accept=".png,.webp,.jpg,.jpeg" label={m.settings_site_fuwari_friendlinks_bg?.() ?? "Friend Links Banner"} placeholder="Leave empty to use default home background" error={errors.site?.theme?.fuwari?.friendLinksBg?.message} />
        {/* Dynamic nav item banners */}
        <NavBannersSection />
      </SectionShell>

      {/* ── Live2D Widget ── */}
      <SectionShell title={m.settings_site_fuwari_live2d?.() ?? "Live2D Mascot"}>
        <ToggleField name="site.theme.fuwari.live2dEnabled" label={m.settings_site_fuwari_live2d_enabled?.() ?? "Enable Live2D Mascot"} />
        <SelectField name="site.theme.fuwari.live2dModel" label={m.settings_site_fuwari_live2d_model?.() ?? "Character"} options={[
          { value: "haru", label: "Haru" },
          { value: "hijiki", label: "Hijiki" },
          { value: "tororo", label: "Tororo" },
          { value: "shizuku", label: "Shizuku" },
        ]} />
        <SelectField name="site.theme.fuwari.live2dPosition" label={m.settings_site_fuwari_live2d_pos?.() ?? "Position"} options={[
          { value: "right", label: "Right" },
          { value: "left", label: "Left" },
        ]} />
      </SectionShell>

      {/* ── BGM Player ── */}
      <SectionShell title={m.settings_site_fuwari_bgm?.() ?? "BGM Player"}>
        <ToggleField name="site.theme.fuwari.bgmEnabled" label={m.settings_site_fuwari_bgm_enabled?.() ?? "Enable BGM Player"} />
        <RangeField name="site.theme.fuwari.bgmDefaultVolume" label={m.settings_site_fuwari_bgm_volume?.() ?? "Default Volume"} min={0} max={100} step={5} unit="%" defaultValue={30} />
        <BgmPlaylistEditor />
      </SectionShell>

      {/* ── Comments ── */}
      <SectionShell title={m.settings_site_fuwari_comments?.() ?? "Comments"}>
        <ToggleField name="site.theme.fuwari.commentStickersEnabled" label={m.settings_site_fuwari_comment_stickers?.() ?? "Enable Anime Stickers"} hint={m.settings_site_fuwari_comment_stickers_hint?.() ?? "Anime-style sticker picker in comment editor"} />
      </SectionShell>

      {/* ── Card Style ── */}
      <SectionShell title={m.settings_site_fuwari_card_style?.() ?? "Card Style"}>
        <RangeField name="site.theme.fuwari.cardBorderRadius" label={m.settings_site_fuwari_card_radius?.() ?? "Card Border Radius"} min={0.5} max={2} step={0.25} unit="rem" defaultValue={1.25} />
        <RangeField name="site.theme.fuwari.cardGlassIntensity" label={m.settings_site_fuwari_card_glass?.() ?? "Glass Effect Intensity"} min={0} max={1} step={0.1} defaultValue={0.65} />
      </SectionShell>

      {/* ── Footer ── */}
      <SectionShell title={m.settings_site_fuwari_footer?.() ?? "Footer"}>
        <TextField name="site.theme.fuwari.footerQuote" label={m.settings_site_fuwari_footer_quote?.() ?? "Footer Quote"} placeholder="「愿你在二次元的世界里，找到属于自己的那片星空 ✨」" hint={m.settings_site_fuwari_footer_quote_hint?.() ?? "Anime-style quote shown in footer"} />
      </SectionShell>

      {/* ── Font ── */}
      <SectionShell title={m.settings_site_fuwari_font?.() ?? "Typography"}>
        <SelectField name="site.theme.fuwari.displayFont" label={m.settings_site_fuwari_display_font?.() ?? "Display Font"} options={[
          { value: "zcool", label: "ZCOOL XiaoWei" },
          { value: "mashan", label: "Ma Shan Zheng" },
          { value: "noto", label: "Noto Sans SC" },
        ]} hint={m.settings_site_fuwari_display_font_hint?.() ?? "Font used for headings and decorative text"} />
      </SectionShell>
    </>
  );
}

/** Dynamic banner upload fields for custom nav items */
function NavBannersSection() {
  const { watch } = useFormContext<SystemConfig>();
  const navItems = watch("site.navItems") as Array<{ id: string; label: { zh: string }; type: string }> | undefined;
  const internalItems = (navItems ?? []).filter((item) => item.type === "internal");

  if (internalItems.length === 0) return null;

  return (
    <>
      {internalItems.map((item, index) => (
        <AssetUploadField
          key={item.id}
          name={`site.navItems.${index}.banner`}
          assetPath={`themes/fuwari/nav-banners/${item.id}.webp`}
          accept=".png,.webp,.jpg,.jpeg"
          label={item.label.zh || item.id}
          hint={m.settings_nav_banner_hint?.() ?? "Banner for this nav section and its sub-pages"}
          placeholder="Leave empty to use home background"
        />
      ))}
    </>
  );
}
