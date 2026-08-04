import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { useToc } from "@/features/theme/themes/fuwari/lib/toc-context";
import TableOfContents from "@/features/theme/themes/fuwari/pages/post/components/table-of-contents";
import { Profile } from "./profile";
import { Tags, TagsSkeleton } from "./tags";

export function Sidebar({ className }: { className?: string }) {
  const toc = useToc();

  return (
    <aside className={cn("flex flex-col gap-4", className)}>
      <div
        className="anime-onload"
        style={{ animationDelay: "100ms" }}
      >
        <Profile />
      </div>
      <div
        className="sticky top-4 anime-onload"
        style={{ animationDelay: "150ms" }}
      >
        <Suspense fallback={<TagsSkeleton />}>
          <Tags />
        </Suspense>
        {toc && toc.length > 0 && (
          <div className="mt-4">
            <TableOfContents headers={toc} />
          </div>
        )}
      </div>
    </aside>
  );
}
