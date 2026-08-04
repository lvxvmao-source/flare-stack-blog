import { useSyncExternalStore } from "react";
import type { TableOfContentsItem } from "@/features/posts/utils/toc";

// Module-level store so Sidebar (in grid's left column) can read
// TOC data set by PostPage (in grid's main column) without needing
// a shared React Context across sibling tree branches.
let currentToc: Array<TableOfContentsItem> = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function setToc(toc: Array<TableOfContentsItem>) {
  currentToc = toc;
  emit();
}

export function clearToc() {
  if (currentToc.length === 0) return;
  currentToc = [];
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentToc;
}

export function useToc(): Array<TableOfContentsItem> | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
