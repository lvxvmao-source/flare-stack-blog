import { ClientOnly } from "@tanstack/react-router";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import { PostLink } from "@/features/posts/components/post-link";
import { m } from "@/paraglide/messages";

interface ArchivePostProps {
  post: PostItem;
}

export function ArchivePost({ post }: ArchivePostProps) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;

  return (
    <PostLink
      slug={post.slug}
      navId={post.navId}
      className="group block! h-10 w-full rounded-lg hover:bg-(--fuwari-btn-plain-bg-hover) active:bg-(--fuwari-btn-plain-bg-active) transition-colors"
      ariaLabel={post.title}
    >
      <div className="flex flex-row justify-start items-center h-full">
        {/* Date */}
        <div className="w-[15%] md:w-[10%] transition text-sm text-right fuwari-text-50">
          <ClientOnly fallback="-">
            {date ? m.format_month_day({ date }) : "-"}
          </ClientOnly>
        </div>

        {/* Dot and Line */}
        <div className="w-[15%] md:w-[10%] relative fuwari-timeline-dash h-full flex items-center">
          <div
            className="anime-timeline-dot transition-all mx-auto group-hover:scale-150 z-50"
          />
        </div>

        {/* Post Title */}
        <div
          className="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
            group-hover:translate-x-1 transition-all group-hover:text-(--fuwari-primary)
            fuwari-text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
        >
          {post.title}
        </div>

        {/* Tag List */}
        <div className="hidden md:block md:w-[15%] text-left text-sm transition whitespace-nowrap overflow-ellipsis overflow-hidden fuwari-text-30">
          {post.tags?.map((t) => `#${t.name}`).join(" ")}
        </div>
      </div>
    </PostLink>
  );
}
