import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSiteTheme } from "@/features/theme/theme-context";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    const themeName = context.siteConfig.themeName;
    // 仅在提供 WelcomePage 的主题下展示欢迎页，其余主题保持原重定向
    if (themeName !== "fuwari") {
      throw redirect({ to: "/home" });
    }
  },
  component: IndexRoute,
});

function IndexRoute() {
  const theme = useSiteTheme();
  if (theme.WelcomePage) {
    return <theme.WelcomePage />;
  }
  return null;
}
