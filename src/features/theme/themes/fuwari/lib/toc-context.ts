import { createContext, useContext } from "react";
import type { TableOfContentsItem } from "@/features/posts/utils/toc";

interface TocContextValue {
  toc: TableOfContentsItem[] | null;
}

export const TocContext = createContext<TocContextValue>({ toc: null });

export function useToc() {
  return useContext(TocContext);
}
