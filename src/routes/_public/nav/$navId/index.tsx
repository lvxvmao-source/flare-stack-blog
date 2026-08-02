import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSiteTheme } from "@/features/theme/theme-context";
import { siteConfigQuery, siteDomainQuery } from "@/features/config/queries";
import { postsInfiniteQueryOptions } from "@/features/posts/queries";
import { getLocale } from "@/paraglide/runtime";
import { buildCanonicalUrl, canonicalLink } from "@/lib/seo";

const postsPerPage = 12;

export const Route = createFileRoute("/_public/nav/$navId/")({
  component: RouteComponent,
  pendingComponent: NavPageSkeleton,
  loader: async ({ context, params }) => {
    const navId = params.navId;
    const [, domain, siteConfig] = await Promise.all([
      context.queryClient.prefetchInfiniteQuery(
        postsInfiniteQueryOptions({ limit: postsPerPage, navId }),
      ),
      context.queryClient.ensureQueryData(siteDomainQuery),
      context.queryClient.ensureQueryData(siteConfigQuery),
    ]);

    const locale = getLocale();
    const navItem = (siteConfig.navItems ?? []).find(
      (item) => item.id === navId,
    );

    if (!navItem) {
      throw notFound();
    }

    const title = navItem.label[locale as "zh" | "en"] ?? navItem.label.zh;
    const description =
      navItem.description?.[locale as "zh" | "en"] ?? "";

    return {
      title,
      description,
      canonicalHref: buildCanonicalUrl(domain, `/nav/${navId}`),
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
  const { navId } = Route.useParams();
  const loaderData = Route.useLoaderData();
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
      title={loaderData.title}
      description={loaderData.description}
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
