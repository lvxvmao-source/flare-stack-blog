import type { ModelOptions } from "oh-my-live2d";
import { useEffect, useRef } from "react";

type Oml2dInstance = ReturnType<typeof import("oh-my-live2d")["loadOml2d"]>;

type PresetModel = "haru" | "hijiki" | "tororo" | "shizuku";
export type Live2dModel = PresetModel | "custom";

export interface Live2dWidgetProps {
  enabled?: boolean;
  model?: Live2dModel;
  position?: "left" | "right";
  /** Live2D model JSON url, used when model === "custom" */
  customModelUrl?: string;
}

/**
 * Live2D model sources, self-hosted under public/live2d/ (same-origin).
 * model.oml2d.com CDN is DNS-hijacked on some mainland China networks,
 * so models are vendored locally instead of loaded from a third-party CDN.
 * (haru/shizuku: Cubism 2; hijiki/tororo: Cubism 2 cat models)
 */
const MODEL_SOURCES: Record<PresetModel, string> = {
  haru: "/live2d/haru/haru01.model.json",
  hijiki: "/live2d/hijiki/hijiki.model.json",
  tororo: "/live2d/tororo/tororo.model.json",
  shizuku: "/live2d/shizuku/shizuku.model.json",
};

const DEFAULT_MESSAGES = [
  "欢迎来到我的博客～",
  "今天也要元气满满哦！",
  "有什么想看的文章吗？",
  "这里的内容很有趣呢～",
];

const MODEL_MESSAGES: Record<Live2dModel, string[]> = {
  haru: DEFAULT_MESSAGES,
  hijiki: [
    "你好呀，旅行者！",
    "要一起探索这个博客吗？",
    "发现有趣的文章了呢！",
    "今天天气真不错～",
  ],
  tororo: [
    "主人，欢迎回来！",
    "需要我帮忙找文章吗？",
    "你写的文章好棒！",
    "今天有什么计划呀？",
  ],
  shizuku: [
    "こんにちは！",
    "这里好漂亮呢～",
    "一起看书吧！",
    "有什么需要帮忙的吗？",
  ],
  custom: DEFAULT_MESSAGES,
};

function isValidModelUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test(url.trim());
}

/** Resolve the model name actually registered in the oml2d options */
function resolveModelName(
  model: Live2dModel,
  customModelUrl: string,
): PresetModel | "custom" {
  if (model === "custom" && isValidModelUrl(customModelUrl)) return "custom";
  return model === "custom" ? "haru" : model;
}

/** Build the full model list for oml2d (presets + custom when available) */
function buildModelOptions(customModelUrl: string): ModelOptions[] {
  const models: ModelOptions[] = (
    Object.keys(MODEL_SOURCES) as PresetModel[]
  ).map((name) => ({ name, path: MODEL_SOURCES[name] }));
  if (isValidModelUrl(customModelUrl)) {
    models.push({ name: "custom", path: customModelUrl.trim() });
  }
  return models;
}

/** Read the theme sakura accent color so the widget blends with the site */
function readSakuraColor(): string {
  if (typeof window === "undefined") return "rgba(240, 150, 180, 1)";
  for (const el of [document.documentElement, document.body]) {
    const value = window
      .getComputedStyle(el)
      .getPropertyValue("--anime-sakura")
      .trim();
    if (value) return value;
  }
  return "rgba(240, 150, 180, 1)";
}

/**
 * oh-my-live2d exposes no destroy() API, so we keep a module-level singleton:
 * the widget DOM is mounted to document.body (survives React remounts) and
 * model switching is done via `loadModelByName` on the existing instance.
 */
let oml2dInstance: Oml2dInstance | null = null;
let initPromise: Promise<Oml2dInstance | null> | null = null;

export function Live2dWidget({
  enabled = true,
  model = "haru",
  position = "right",
  customModelUrl = "",
}: Live2dWidgetProps) {
  const loadedModelRef = useRef<string | null>(null);

  // Initialize once per page load (position is fixed for the session)
  useEffect(() => {
    if (!enabled || initPromise) return;

    const targetName = resolveModelName(model, customModelUrl);
    // The instance loads models[0] on boot, so the selected model is placed
    // first and we remember it as the currently loaded model.
    loadedModelRef.current = targetName;

    const models = buildModelOptions(customModelUrl);
    const ordered = [
      ...models.filter((m) => m.name === targetName),
      ...models.filter((m) => m.name !== targetName),
    ];

    initPromise = (async () => {
      const { loadOml2d } = await import("oh-my-live2d");
      if (oml2dInstance) return oml2dInstance;
      oml2dInstance = loadOml2d({
        dockedPosition: position,
        primaryColor: readSakuraColor(),
        sayHello: false,
        transitionTime: 800,
        models: ordered,
        tips: (currentModel: ModelOptions) => ({
          idleTips: {
            wordTheDay: false,
            interval: 10000,
            message:
              MODEL_MESSAGES[currentModel.name as Live2dModel] ??
              DEFAULT_MESSAGES,
          },
          copyTips: {
            message: ["你复制了什么内容呢?记得注明出处哦~"],
          },
        }),
      });
      return oml2dInstance;
    })().catch((error) => {
      console.warn("[live2d] failed to initialize:", error);
      initPromise = null;
      return null;
    });

    return () => {
      // Intentionally left empty: no destroy API, widget persists site-wide.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Switch models when the config changes (requires page reload when the
  // custom URL itself changes, since model paths are fixed at init time)
  useEffect(() => {
    if (!enabled || !initPromise) return;
    const targetName = resolveModelName(model, customModelUrl);
    if (loadedModelRef.current === targetName) return;
    loadedModelRef.current = targetName;

    initPromise.then((oml2d) => {
      if (!oml2d) return;
      oml2d
        .loadModelByName(targetName)
        .catch((error: unknown) =>
          console.warn("[live2d] failed to switch model:", error),
        );
    });
  }, [enabled, model, customModelUrl]);

  // Pure controller component; oh-my-live2d renders its own DOM
  return null;
}
