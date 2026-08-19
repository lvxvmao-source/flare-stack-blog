import type { MenusOptions, ModelOptions, TipsOptions } from "oh-my-live2d";
import { useEffect, useRef } from "react";

type Oml2dInstance = ReturnType<typeof import("oh-my-live2d")["loadOml2d"]>;

type PresetModel = "miku";
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
 * (miku: Cubism 4 model from Steam Workshop 3779598652)
 */
const MODEL_SOURCES: Record<PresetModel, string> = {
  miku: "/live2d/miku/model3.json",
};

const DEFAULT_MESSAGES = [
  "欢迎来到我的博客～",
  "今天也要元气满满哦！",
  "有什么想看的文章吗？",
  "这里的内容很有趣呢～",
];

/**
 * Initial stage box — used only as the model's first-center fallback.
 *
 * Important: oh-my-live2d re-sizes the stage to the model's real rendered size
 * (`this.models.modelSize`) right after the model loads (index.js:28375) and centers the
 * model. The Miku model3.json ships without a Cubism `Layout` section, so pixi's reported
 * bounds are a little shorter than the actual artwork and the head pokes above the stage
 * top. `fitStageToModel()` runs *after* that load-time sizing to enlarge the stage (extra
 * top padding) and nudge the model down, giving the head clearance.
 */
const STAGE_SIZE: { width: number; height: number } = {
  width: 380,
  height: 520,
};
const MOBILE_STAGE_SIZE: { width: number; height: number } = {
  width: 300,
  height: 420,
};

/** Extra stage padding so the whole character (incl. head) is visible after load. */
const STAGE_MARGIN_X = 0.12; // 12% each side
const STAGE_MARGIN_TOP = 0.45; // extra 45% of model height on top, for the head

/** Per-model scale / position (miku is a very large Cubism 4 canvas) */
const MODEL_CONFIG: Record<PresetModel, Partial<ModelOptions>> = {
  miku: {
    scale: 0.05,
    mobileScale: 0.035,
    anchor: [0.5, 0.5],
    position: [STAGE_SIZE.width / 2, STAGE_SIZE.height / 2],
    mobilePosition: [MOBILE_STAGE_SIZE.width / 2, MOBILE_STAGE_SIZE.height / 2],
  },
};

const MODEL_MESSAGES: Record<Live2dModel, string[]> = {
  miku: [
    "初音未来来报到了！",
    "准备好听歌了吗？",
    "今天的博客也要充满活力哦～",
    "呼呼，葱给你♪",
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
  return "miku";
}

/** Build the full model list for oml2d (presets + custom when available) */
function buildModelOptions(customModelUrl: string): ModelOptions[] {
  const models: ModelOptions[] = (
    Object.keys(MODEL_SOURCES) as PresetModel[]
  ).map((name) => ({
    name,
    path: MODEL_SOURCES[name],
    ...MODEL_CONFIG[name],
  }));
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
 * oml2d's built-in iconfont only ships about/rest/switch/skin/like/setting/loading
 * icons — no "dialogue" icon. We inject a chat-bubble symbol once so the custom
 * "对话" menu item can reference it via `<use xlink:href="#icon-chat">`.
 */
function ensureChatIcon(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("oml2d-icon-chat")) return;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("id", "oml2d-icon-chat");
  svg.setAttribute(
    "style",
    "position:absolute;width:0;height:0;overflow:hidden;",
  );
  const symbol = document.createElementNS(svgNS, "symbol");
  symbol.setAttribute("id", "icon-chat");
  symbol.setAttribute("viewBox", "0 0 1024 1024");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute(
    "d",
    "M896 128H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h128v192l256-192h384c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64zM256 416h512v64H256v-64zm0-128h512v64H256v-64z",
  );
  path.setAttribute("fill", "currentColor");
  symbol.appendChild(path);
  svg.appendChild(symbol);
  document.body.appendChild(svg);
}

/**
 * Hide the whole Live2D widget from the welcome page.
 *
 * The widget is a module-level singleton mounted on `document.body`, so once it has
 * been initialized on any normal (PublicLayout) page it keeps rendering even when the
 * route switches to the welcome page (which lives outside PublicLayout). We hide it by
 * toggling a body class plus an injected CSS rule that targets every oml2d root element
 * (`oml2d-stage` / `oml2d-menus` / `oml2d-tips` / `oml2d-statusBar`). Using CSS (rather
 * than touching each element directly) also catches elements created lazily afterwards
 * (e.g. idle tips), and restores instantly on unmount.
 */
function ensureHiddenStyle(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("oml2d-welcome-hide-style")) return;
  const style = document.createElement("style");
  style.id = "oml2d-welcome-hide-style";
  style.textContent =
    "body.oml2d-hidden-welcome .oml2d-stage," +
    "body.oml2d-hidden-welcome .oml2d-menus," +
    "body.oml2d-hidden-welcome .oml2d-tips," +
    "body.oml2d-hidden-welcome .oml2d-statusBar{display:none!important;}";
  document.head.appendChild(style);
}

export function setLive2dVisible(visible: boolean): void {
  if (typeof document === "undefined") return;
  ensureHiddenStyle();
  document.body.classList.toggle("oml2d-hidden-welcome", !visible);
}

/**
 * Build the menu config: keep the default items but replace "关于/About" with "对话".
 * `Item` is not re-exported by oh-my-live2d, so the `items` callback's parameter type
 * is left to be inferred from the contextual `MenusOptions["items"]` signature.
 */
function buildMenus(): MenusOptions {
  return {
    items: (defaultItems) => {
      const base = defaultItems.filter((item) => item.id !== "About");
      return [
        ...base,
        {
          id: "Dialogue",
          title: "对话",
          icon: "icon-chat",
          onClick: (oml2d) => {
            const currentName =
              (oml2d.options.models?.[oml2d.modelIndex]?.name as
                | Live2dModel
                | undefined) ?? "miku";
            const lines = MODEL_MESSAGES[currentName] ?? DEFAULT_MESSAGES;
            const line = lines[Math.floor(Math.random() * lines.length)];
            if (line) oml2d.tipsMessage(line, 5000, 4);
          },
        },
      ];
    },
  };
}

/**
 * Re-fit the stage after oh-my-live2d's own load-time sizing so the whole figure
 * (including the head, which pixi under-reports without a Cubism `Layout`) is visible.
 *
 * oml2d sizes the stage to `models.modelSize` and centers the model on load
 * (index.js:28375). Because the Miku model3.json lacks a `Layout` section, pixi's
 * reported bounds are shorter than the artwork, so the head gets clipped at the top.
 * We enlarge the stage (extra top padding) and shift the model down so the head clears.
 *
 * The public oml2d types don't expose `stage` / `models.modelSize` / `setModelPosition`,
 * so we reach them through a minimal structural cast.
 */
interface Oml2dInternal {
  stage?: { reloadStyle: (style: Record<string, unknown>) => void };
  models?: {
    modelSize?: { width: number; height: number };
    model?: { once: (event: string, cb: () => void) => void };
  };
  setModelPosition: (pos: { x: number; y: number }) => void;
}

function fitStageToModel(oml2d: Oml2dInstance): void {
  // This only makes sense in the browser; never run during SSR.
  if (typeof window === "undefined") return;
  const internal = oml2d as unknown as Oml2dInternal;
  let applied = false;
  let tries = 0;
  // Miku is ~32MB and loads slowly. `loadOml2d` returns before the pixi model
  // exists, so we can't attach `model.once("ready")` up-front (it would no-op).
  // Poll on rAF until the model is measured, then enlarge the stage once.
  // Allow up to ~10s (600 frames @60fps) for a slow first load.
  const MAX_TRIES = 600;
  const apply = () => {
    if (applied) return;
    const pixiModel = internal.models?.model;
    const size = internal.models?.modelSize;
    // Model not created/measured yet — keep polling (capped) until it is.
    if (!pixiModel || !size || !size.width || !size.height) {
      if (typeof requestAnimationFrame === "function" && tries++ < MAX_TRIES) {
        requestAnimationFrame(apply);
      }
      return;
    }
    try {
      const w = Math.ceil(size.width * (1 + STAGE_MARGIN_X * 2));
      const h = Math.ceil(size.height * (1 + STAGE_MARGIN_TOP + 0.05));
      internal.stage?.reloadStyle({ width: w, height: h });
      internal.setModelPosition({
        x: w / 2,
        y: size.height * STAGE_MARGIN_TOP + size.height / 2,
      });
      applied = true;
    } catch (err) {
      // A sizing hiccup must never break the widget's load.
      console.warn("[live2d] fitStageToModel failed:", err);
    }
  };
  apply();
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
  model = "miku",
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
      ensureChatIcon();
      oml2dInstance = loadOml2d({
        dockedPosition: position,
        primaryColor: readSakuraColor(),
        sayHello: false,
        transitionTime: 800,
        models: ordered,
        menus: buildMenus(),
        tips: (currentModel: ModelOptions): TipsOptions => ({
          style: {
            bottom: "110%",
            top: "auto",
            minHeight: "50px",
            width: "85%",
          },
          mobileStyle: {
            bottom: "110%",
            top: "auto",
            minHeight: "44px",
            width: "90%",
          },
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
      fitStageToModel(oml2dInstance);
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
