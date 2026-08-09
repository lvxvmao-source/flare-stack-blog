import { useNavigate } from "@tanstack/react-router";
import { useRouteContext } from "@tanstack/react-router";

function isVideoBackground(url: string): boolean {
  const lower = url.split("?")[0].toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".webm");
}

export function WelcomePage() {
  const navigate = useNavigate();
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const background = siteConfig.theme.fuwari.welcome.background.trim();

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-white text-center"
      style={{ minHeight: "100vh" }}
    >
      {background ? (
        <>
          {isVideoBackground(background) ? (
            <video
              src={background}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
          ) : (
            <img
              src={background}
              alt=""
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
          )}
          {/* legibility scrim */}
          <div className="absolute inset-0 z-10 bg-black/30" />
        </>
      ) : null}

      <button
        type="button"
        onClick={() => navigate({ to: "/home" })}
        className="relative z-20 rounded-full bg-black px-10 py-3 text-lg font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        进入
      </button>
    </main>
  );
}
