import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout route for nav-id-based paths (/nav/{navId}).
 */
export const Route = createFileRoute("/_public/nav/$navId")({
  component: Outlet,
});
