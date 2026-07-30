import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout route for custom nav paths (/{navSlug}).
 * Each child route independently validates the navSlug against site config.
 */
export const Route = createFileRoute("/_public/$navSlug")({
  component: Outlet,
});
