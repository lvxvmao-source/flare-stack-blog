import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSiteTheme } from "@/features/theme/theme-context";
import { siteConfigQuery, siteDomainQuery } from "@/features/config/queries";
import { recordPageViewFn } from "@/features/pageview/api/pageview.api";
import { postBySlugQuery, relatedPostsQuery } from "@/features/posts/queries";
import {
  buildArticleJsonLd,
  buildCanonicalUrl,
  canonicalLink,
} from "@/lib/seo";

const relatedPostsLimit = 11;

export const Route = createFileRoute("/_public/nav/$navId/$postSlug")({
  component: PostPageRoute,
  pendingComponent: PostPageSkeleton,
  pendingMs: 500,
  loader: async ({ context, params }) => {
    const navId = params.navId;
    const siteConfig =
      await context.queryClient.ensureQueryData(siteConfigQuery);
    const navItem = (siteConfig.navItems ?? []).find(
      (item) => item.id === navId,
    );
    if (!navItem) throw notFound();

    const [post, domain] = await Promise.all([
      context.queryClient.ensureQueryData(postBySlugQuery(params.postSlug)),
      context.queryClient.ensureQueryData(siteDomainQuery),
    ]);

    if (!post) throw notFound();

    void context.queryClient.prefetchQuery(
      relatedPostsQuery(params.postSlug, relatedPostsLimit),
    );

    return {
      post,
      authorName: siteConfig.author,
      canonicalHref: buildCanonicalUrl(
        domain,
        `${navItem.to}/${encodeURIComponent(post.slug)}`,
      ),
    };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    const canonicalHref = loaderData?.canonicalHref ?? "";

    return {
      meta: [
        { title: post?.title },
        { name: "description", content: post?.summary ?? "" },
        { property: "og:title", content: post?.title ?? "" },
        { property: "og:description", content: post?.summary ?? "" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonicalHref },
      ],
      links: [canonicalLink(canonicalHref)],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: buildArticleJsonLd({
                authorName: loaderData.authorName,
                canonicalHref,
                post,
              }),
            },
          ]
        : [],
    };
  },
});

function PostPageSkeleton() {
  const theme = useSiteTheme();
  return <theme.PostPageSkeleton />;
}

function PostPageRoute() {
  const { postSlug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postBySlugQuery(postSlug));
  const theme = useSiteTheme();

  useEffect(() => {
    if (!post?.id) return;
    try {
      const key = `pv:${post.id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Safari private mode / storage disabled — record anyway
    }
    void recordPageViewFn({ data: { postId: post.id } });
  }, [post?.id]);

  if (!post) throw notFound();

  return <theme.PostPage post={post} />;
}
