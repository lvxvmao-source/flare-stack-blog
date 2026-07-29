import { useEffect, useRef } from "react";
import type { NavPageProps } from "@/features/theme/contract/pages/nav-page";
import { PostItem } from "@/features/theme/themes/default/components/post-item";
import { m } from "@/paraglide/messages";

export function NavPage({
  title,
  description,
  posts,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: NavPageProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "0px" },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full max-w-3xl mx-auto pb-20 px-6 md:px-0">
      {/* Header */}
      <header className="py-12 md:py-20 space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-base md:text-lg font-light text-muted-foreground leading-relaxed">
            {description}
          </p>
        ) : null}
      </header>

      {/* Posts List */}
      <div className="flex flex-col gap-0 border-t border-border/40">
        {posts.length === 0 ? (
          <div className="py-20 text-left">
            <p className="font-serif text-xl text-muted-foreground/50">
              {m.posts_no_posts()}
            </p>
          </div>
        ) : (
          posts.map((post) => <PostItem key={post.id} post={post} />)
        )}
      </div>

      {/* Load More */}
      <div
        ref={observerRef}
        className="py-16 flex flex-col items-center justify-center gap-6"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500 fill-mode-both">
            <div className="w-1.5 h-1.5 bg-foreground animate-ping" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground uppercase">
              {m.posts_loading()}
            </span>
          </div>
        ) : hasNextPage ? (
          <div className="h-px w-24 bg-border/40" />
        ) : posts.length > 0 ? (
          <div className="flex items-center gap-4 text-muted-foreground/20">
            <span className="h-px w-12 bg-current" />
            <span className="text-lg font-serif italic">{m.posts_end()}</span>
            <span className="h-px w-12 bg-current" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
