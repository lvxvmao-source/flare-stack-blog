import { useNavigate } from "@tanstack/react-router";

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white text-center"
      style={{ minHeight: "100vh" }}
    >
      <button
        type="button"
        onClick={() => navigate({ to: "/home" })}
        className="rounded-full bg-black px-10 py-3 text-lg font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        进入
      </button>
    </main>
  );
}
