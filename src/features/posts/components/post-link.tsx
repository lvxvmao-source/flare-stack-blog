import { Link, useRouteContext } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface PostLinkProps {
  slug: string;
  navId: string | null;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/**
 * Generates the correct route link for a post:
 * - If post belongs to a nav with custom path → /{navPath}/{slug}
 * - Otherwise → /post/{slug}
 */
export function PostLink({
  slug,
  navId,
  children,
  className,
  ariaLabel,
}: PostLinkProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  if (navId) {
    const navItem = (siteConfig.navItems ?? []).find(
      (item) => item.id === navId,
    );
    if (navItem?.to?.startsWith("/") && navItem.to !== "/") {
      const navSlug = navItem.to.replace(/^\//, "");
      return (
        <Link
          to="/$navSlug/$postSlug"
          params={{ navSlug, postSlug: slug }}
          className={className}
          aria-label={ariaLabel}
        >
          {children}
        </Link>
      );
    }
  }

  return (
    <Link
      to="/post/$slug"
      params={{ slug }}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
