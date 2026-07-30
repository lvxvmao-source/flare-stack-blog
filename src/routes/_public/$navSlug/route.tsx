import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { siteConfigQuery } from "@/features/config/queries";

/**
 * Layout route for custom nav paths (/{navSlug}).
 * Looks up the nav item by its `to` field and provides navId to children.
 */
export const Route = createFileRoute("/_public/$navSlug")({
  component: Outlet,
  loader: async ({ context, params }) => {
    const navSlug = params.navSlug;
    const siteConfig =
      await context.queryClient.ensureQueryData(siteConfigQuery);

    const navItem = (siteConfig.navItems ?? []).find(
      (item) => item.to.replace(/^\//, "") === navSlug,
    );

    if (!navItem) {
      throw notFound();
    }

    return { navId: navItem.id, navItem };
  },
});
