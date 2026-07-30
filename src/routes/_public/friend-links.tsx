import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useSiteTheme } from "@/features/theme/theme-context";
import { approvedFriendLinksQuery } from "@/features/friend-links/queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/friend-links")({
  component: FriendLinksPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(approvedFriendLinksQuery());

    return {
      title: m.friend_links_title(),
      description: m.friend_links_desc(),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
      {
        name: "description",
        content: loaderData?.description,
      },
    ],
  }),
  pendingComponent: FriendLinksPageSkeleton,
});

function FriendLinksPage() {
  const { data: links } = useSuspenseQuery(approvedFriendLinksQuery());
  const theme = useSiteTheme();

  return <theme.FriendLinksPage links={links} />;
}

function FriendLinksPageSkeleton() {
  const theme = useSiteTheme();
  return <theme.FriendLinksPageSkeleton />;
}
