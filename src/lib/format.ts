import { formatDistanceToNowStrict, isToday, isYesterday, differenceInDays } from "date-fns";

/**
 * Human-friendly relative timestamp used across the app.
 * < 1 min → "just now"
 * < 60 min → "5m ago"
 * today → "2h ago"
 * yesterday → "yesterday"
 * within 7 days → "3d ago"
 * else → formatted date
 */
export function relativeTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffSec = (now.getTime() - date.getTime()) / 1000;

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (isToday(date)) return `${Math.floor(diffSec / 3600)}h ago`;
  if (isYesterday(date)) return "yesterday";
  if (differenceInDays(now, date) < 7) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: now.getFullYear() === date.getFullYear() ? undefined : "numeric",
  });
}

export function groupByDate<T extends { updatedAt?: string; createdAt?: string }>(
  items: T[]
): { label: string; items: T[] }[] {
  const now = new Date();
  const buckets: Record<string, T[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    "Previous 30 days": [],
    Older: [],
  };

  for (const item of items) {
    const raw = item.updatedAt ?? item.createdAt;
    if (!raw) {
      buckets["Older"].push(item);
      continue;
    }
    const date = new Date(raw);
    const days = differenceInDays(now, date);
    if (isToday(date)) buckets["Today"].push(item);
    else if (isYesterday(date)) buckets["Yesterday"].push(item);
    else if (days < 7) buckets["Previous 7 days"].push(item);
    else if (days < 30) buckets["Previous 30 days"].push(item);
    else buckets["Older"].push(item);
  }

  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([label, arr]) => ({ label, items: arr }));
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
