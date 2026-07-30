import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSiteTheme } from "@/features/theme/theme-context";
import { siteDomainQuery } from "@/features/config/queries";
import { postsInfiniteQueryOptions } from "@/features/posts/queries";
import { buildCanonicalUrl, canonicalLink } from "@/lib/seo";
import { getLocale } from "@/paraglide/runtime";

const postsPerPage = 12;

export const Route = createFileRoute("/_public/$navSlug/")({
  component: RouteComponent,
  pendingComponent: NavPageSkeleton,
  loader: async ({ context }) => {
    const { navId, navItem } = context as { navId: string; navItem: { label: Record<string, string>; description?: Record<string, string>; to: string } };
    const [domain] = await Promise.all([
      context.queryClient.ensureQueryData(siteDomainQuery),
      context.queryClient.prefetchInfiniteQuery(
        postsInfiniteQueryOptions({ limit: postsPerPage, navId }),
      ),
    ]);

    const locale = getLocale();
    const title = navItem.label[locale as "zh" | "en"] ?? navItem.label.zh;
    const description =
      navItem.description?.[locale as "zh" | "en"] ?? "";

    return {
      title,
      description,
      canonicalHref: buildCanonicalUrl(domain, navItem.to),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
      ...(loaderData?.description
        ? [{ name: "description" as const, content: loaderData.description }]
        : []),
    ],
    links: [canonicalLink(loaderData?.canonicalHref ?? "/")],
  }),
});

function RouteComponent() {
  const { navId, navItem } = Route.useLoaderData({
    from: "/_public/$navSlug",
  });
  const theme = useSiteTheme();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      postsInfiniteQueryOptions({ limit: postsPerPage, navId }),
    );

  const posts = useMemo(() => {
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  return (
    <theme.NavPage
      title={navItem.label?.zh ?? ""}
      description={navItem.description?.zh ?? ""}
      posts={posts}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

function NavPageSkeleton() {
  const theme = useSiteTheme();
  return <theme.NavPageSkeleton />;
}
