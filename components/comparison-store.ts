"use client";

import { useSyncExternalStore } from "react";
import { COMPARISON_STORAGE_KEY, readComparisonSelection, toggleComparison, type ComparisonSelection } from "@/lib/product-comparison";

type Snapshot = { items: ComparisonSelection[]; ready: boolean; notice: string };
const serverSnapshot: Snapshot = { items: [], ready: false, notice: "" };
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
function readStorage() {
  try { return readComparisonSelection(window.localStorage.getItem(COMPARISON_STORAGE_KEY)); }
  catch { return []; }
}
function onStorage(event: StorageEvent) {
  if (event.key !== COMPARISON_STORAGE_KEY && event.key !== null) return;
  snapshot = { items: readStorage(), ready: true, notice: "" };
  emit();
}
function subscribe(listener: () => void) {
  if (!snapshot.ready) snapshot = { items: readStorage(), ready: true, notice: "" };
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
function publish(items: ComparisonSelection[], notice: string) {
  snapshot = { items, ready: true, notice };
  try { window.localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(items)); } catch { /* Selection still works in this tab if storage is unavailable. */ }
  emit();
}
export function toggleComparedProduct(item: ComparisonSelection) {
  const next = toggleComparison(snapshot.items, item);
  publish(next.items, next.notice);
}
export function removeComparedProduct(id: string) {
  publish(snapshot.items.filter((item) => item.id !== id), "compare.removed");
}
export function clearComparison() { publish([], "compare.cleared"); }
export function useComparison() {
  return useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
}
