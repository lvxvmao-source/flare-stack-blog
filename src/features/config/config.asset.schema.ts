import type { ThemeName } from "@/features/theme/registry";
import { themeNames } from "@/features/theme/registry";
import type { Messages } from "@/lib/i18n";

export const SITE_ASSET_MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB for images
export const SITE_ASSET_VIDEO_MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB for welcome-page videos

export const SITE_ASSET_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
] as const;

export const SITE_ASSET_VIDEO_ACCEPTED_TYPES = [
  "video/mp4",
  "video/webm",
] as const;

type ThemePrefix = `themes/${ThemeName}/`;
const themePrefixes = themeNames.map(
  (name) => `themes/${name}/` satisfies ThemePrefix,
);
const ALLOWED_ASSET_PREFIXES = [
  "favicon/",
  "social/",
  ...themePrefixes,
] as const;

function isAllowedAssetPath(path: string): boolean {
  const normalized = path.replace(/^\/+/, "").replace(/\\/g, "/");
  return ALLOWED_ASSET_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

/** True when the file looks like a supported welcome-page video (.mp4/.webm). */
export function isVideoAsset(file: File): boolean {
  const mime = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase();
  return (
    (SITE_ASSET_VIDEO_ACCEPTED_TYPES as readonly string[]).includes(mime) ||
    ext === "mp4" ||
    ext === "webm"
  );
}

export function parseSiteAssetUploadInput(
  formData: FormData,
  messages: Messages,
): { file: File; assetPath: string } {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error(messages.settings_asset_validation_file_required());
  }

  const assetPath = formData.get("assetPath");
  if (typeof assetPath !== "string" || !assetPath.trim()) {
    throw new Error(messages.settings_asset_validation_path_required());
  }

  const trimmedPath = assetPath.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  if (!isAllowedAssetPath(trimmedPath)) {
    throw new Error(messages.settings_asset_validation_path_invalid());
  }

  const video = isVideoAsset(file);
  const maxSize = video ? SITE_ASSET_VIDEO_MAX_FILE_SIZE : SITE_ASSET_MAX_FILE_SIZE;
  if (file.size > maxSize) {
    throw new Error(
      video
        ? messages.settings_asset_validation_video_too_large()
        : messages.settings_asset_validation_file_too_large(),
    );
  }

  const mime = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase();
  const allowedMimes = new Set<string>([
    ...SITE_ASSET_ACCEPTED_TYPES,
    ...SITE_ASSET_VIDEO_ACCEPTED_TYPES,
  ]);
  const allowedExts = new Set([
    "jpeg",
    "jpg",
    "png",
    "webp",
    "gif",
    "svg",
    "ico",
    "mp4",
    "webm",
  ]);

  if (!allowedMimes.has(mime) && !allowedExts.has(ext ?? "")) {
    throw new Error(messages.settings_asset_validation_file_invalid_type());
  }

  return { file, assetPath: trimmedPath };
}
