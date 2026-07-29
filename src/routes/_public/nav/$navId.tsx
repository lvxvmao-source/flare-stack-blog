import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import theme from "@theme";
import { useMemo } from "react";
import { siteConfigQuery, siteDomainQuery } from "@/features/config/queries";
import { postsInfiniteQueryOptions } from "@/features/posts/queries";
import { getLocale } from "@/paraglide/runtime";
import { buildCanonicalUrl, canonicalLink } from "@/lib/seo";

const { postsPerPage } = theme.config.posts;

export const Route = createFileRoute("/_public/nav/$navId")({
  component: RouteComponent,
  pendingComponent: NavPageSkeleton,
  loader: async ({ context, params }) => {
    const [, domain, siteConfig] = await Promise.all([
      context.queryClient.prefetchInfiniteQuery(
        postsInfiniteQueryOptions({ limit: postsPerPage }),
      ),
      context.queryClient.ensureQueryData(siteDomainQuery),
      context.queryClient.ensureQueryData(siteConfigQuery),
    ]);

    const locale = getLocale();
    const navItem = (siteConfig.navItems ?? []).find(
      (item) => item.id === params.navId,
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
      canonicalHref: buildCanonicalUrl(domain, `/nav/${params.navId}`),
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
    link: [canonicalLink(loaderData?.canonicalHref ?? "/")],
    links: [canonicalLink(loaderData?.canonicalHref ?? "/")],
  }),
});

function RouteComponent() {
  const { navId } = Route.useParams();
  const loaderData = Route.useLoaderData();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      postsInfiniteQueryOptions({ limit: postsPerPage }),
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
  return <theme.NavPageSkeleton />;
}
