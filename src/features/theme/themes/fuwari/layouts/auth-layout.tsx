import { ArrowLeft } from "lucide-react";
import type { AuthLayoutProps } from "@/features/theme/contract/layouts";
import { m } from "@/paraglide/messages";

export function AuthLayout({ onBack, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-(--fuwari-page-bg) text-(--fuwari-text-75) flex flex-col items-center justify-center p-4">
      {/* Anime decorative background — layered sakura-toned blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-8%] w-[45%] h-[45%] rounded-full blur-3xl opacity-[0.06]"
          style={{ background: "var(--anime-sakura-light)" }} />
        <div className="absolute bottom-[-12%] right-[-8%] w-[40%] h-[40%] rounded-full blur-3xl opacity-[0.05]"
          style={{ background: "var(--anime-sakura)" }} />
        <div className="absolute top-[40%] left-[55%] w-[25%] h-[25%] rounded-full blur-2xl opacity-[0.04]"
          style={{ background: "var(--anime-sakura-pale)" }} />

        {/* Subtle decorative sakura dots pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" aria-hidden="true">
          <defs>
            <pattern id="sakura-dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="currentColor" style={{ color: "var(--anime-sakura)" }} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sakura-dots)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10 anime-onload">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="group absolute -top-14 left-0 flex items-center justify-center w-10 h-10 rounded-xl anime-glass shadow-sm text-(--fuwari-text-50) hover:text-(--fuwari-text-90) hover:shadow-md transition-all shrink-0"
          title={m.auth_layout_back_home()}
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
        </button>

        {/* Auth Card Container — frosted glass */}
        <div className="anime-glass p-8 md:p-10 w-full shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
