import { useEffect, useRef, useState } from "react";
import { X, MessageCircleHeart } from "lucide-react";

type Live2dModel = "haru" | "hijiki" | "tororo" | "shizuku";

interface Live2dWidgetProps {
  enabled?: boolean;
  model?: Live2dModel;
  position?: "left" | "right";
}

const MODEL_MESSAGES: Record<Live2dModel, string[]> = {
  haru: [
    "欢迎来到我的博客～",
    "今天也要元气满满哦！",
    "有什么想看的文章吗？",
    "这里的内容很有趣呢～",
  ],
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
};

const MODEL_COLORS: Record<Live2dModel, string> = {
  haru: "oklch(0.72 0.14 350)",
  hijiki: "oklch(0.7 0.12 250)",
  tororo: "oklch(0.68 0.14 50)",
  shizuku: "oklch(0.65 0.14 180)",
};

export function Live2dWidget({
  enabled = true,
  model = "haru",
  position = "right",
}: Live2dWidgetProps) {
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const messages = MODEL_MESSAGES[model];
  const accentColor = MODEL_COLORS[model];
  const posClass = position === "left" ? "left-4" : "right-4";

  const showMessage = () => {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setMessage(msg);
    setShowBubble(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowBubble(false), 3500);
  };

  useEffect(() => {
    // Show greeting on mount
    const t = setTimeout(showMessage, 1500);
    return () => clearTimeout(t);
  }, [model]);

  if (!enabled || !visible) return null;

  return (
    <div
      className={`fixed bottom-4 ${posClass} z-40 transition-all duration-300 ease-out-quart`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Speech bubble */}
      {showBubble && (
        <div
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm max-w-[200px] text-center shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{
            backgroundColor: "var(--anime-glass-bg)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--anime-glass-border)",
            color: "var(--fuwari-text-90)",
          }}
        >
          {message}
          <div
            className="absolute -bottom-1.5 left-6 w-3 h-3 rotate-45"
            style={{
              backgroundColor: "var(--anime-glass-bg)",
              borderRight: "1px solid var(--anime-glass-border)",
              borderBottom: "1px solid var(--anime-glass-border)",
            }}
          />
        </div>
      )}

      {/* Widget body */}
      <div
        className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${accentColor}, oklch(0.85 0.06 350))`,
          boxShadow: isHovered
            ? `0 0 24px ${accentColor} / 0.4, 0 4px 20px ${accentColor} / 0.25`
            : `0 0 12px ${accentColor} / 0.25`,
          transform: isHovered ? "scale(1.08)" : "scale(1)",
        }}
        onClick={showMessage}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && showMessage()}
        aria-label={`Live2D character ${model}`}
      >
        <MessageCircleHeart size={30} className="text-white" />

        {/* Close button (visible on hover) */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVisible(false);
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
            aria-label="Close widget"
          >
            <X size={12} className="text-white" />
          </button>
        )}
      </div>

      {/* Model name label */}
      {isHovered && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-(--fuwari-text-50) whitespace-nowrap">
          {model}
        </div>
      )}
    </div>
  );
}
