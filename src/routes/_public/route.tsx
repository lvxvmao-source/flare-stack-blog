import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { AUTH_KEYS } from "@/features/auth/queries";
import { siteStatsQueryOptions } from "@/features/site-stats/queries";
import { getThemePreloadImages } from "@/features/theme/site-config.helpers";
import { useSiteTheme, type ThemeName } from "@/features/theme/theme-context";
import { authClient } from "@/lib/auth/auth.client";
import { getLogoutAuthErrorMessage } from "@/lib/auth/auth-errors";
import { CACHE_CONTROL } from "@/lib/constants";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import type { NavOption } from "@/features/theme/contract/layouts";

export const Route = createFileRoute("/_public")({
  loader: async ({ context }) => {
    const themeName = (context.siteConfig?.themeName ?? "default") as ThemeName;
    await context.queryClient.ensureQueryData(siteStatsQueryOptions);
    return {
      preloadImages: getThemePreloadImages(context.siteConfig, themeName),
    };
  },
  component: PublicLayout,
  headers: () => {
    return CACHE_CONTROL.public;
  },
  head: ({ loaderData }) => ({
    links: (loaderData?.preloadImages ?? []).map((href) => ({
      rel: "preload" as const,
      as: "image",
      href,
    })),
  }),
});

function PublicLayout() {
  const navigate = useNavigate();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const queryClient = useQueryClient();
  const theme = useSiteTheme();

  const { siteConfig } = useRouteContext({ from: "__root__" });
  const locale = getLocale();

  const builtInNavOptions: NavOption[] = [
    { label: m.nav_home(), to: "/", id: "home" },
    { label: m.nav_posts(), to: "/posts", id: "posts" },
  ];

  const customNavOptions: NavOption[] = (siteConfig.navItems ?? []).map(
    (item) => ({
      id: item.id,
      label: item.label[locale] ?? item.label.zh,
      to: item.type === "internal" ? item.to : item.to,
      external: item.type === "external",
      openInNewTab: item.openInNewTab,
    }),
  );

  const navOptions: NavOption[] = [
    ...builtInNavOptions,
    ...customNavOptions,
    { label: m.nav_friend_links(), to: "/friend-links", id: "friend-links" },
  ];

  const logout = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(m.auth_logout_failed(), {
        description:
          getLogoutAuthErrorMessage(error, m) ?? m.auth_logout_failed_desc(),
      });
      return;
    }

    queryClient.removeQueries({ queryKey: AUTH_KEYS.session });

    toast.success(m.auth_logout_success(), {
      description: m.auth_logout_success_desc(),
    });
  };

  // Global shortcut: Cmd/Ctrl + K to navigate to search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isToggle = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isToggle) {
        e.preventDefault();
        navigate({ to: "/search" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <>
      <theme.PublicLayout
        navOptions={navOptions}
        user={session?.user}
        isSessionLoading={isSessionPending}
        logout={logout}
      >
        <Outlet />
      </theme.PublicLayout>
      <theme.Toaster />
    </>
  );
}
