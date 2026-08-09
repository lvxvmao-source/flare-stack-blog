import { useNavigate } from "@tanstack/react-router";

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-(--fuwari-text)">欢迎</h1>
        <p className="text-base text-(--fuwari-text-muted)">
          欢迎来到本站，点击进入主界面
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate({ to: "/home" })}
        className="rounded-full bg-(--fuwari-accent) px-8 py-3 text-lg font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        进入
      </button>
    </div>
  );
}
