import type { PostItem } from "@/features/posts/schema/posts.schema";

export interface NavPageProps {
  title: string;
  description: string;
  posts: Array<PostItem>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}
