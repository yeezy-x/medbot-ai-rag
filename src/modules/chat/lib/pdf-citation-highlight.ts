const HIGHLIGHT_ATTR = "data-citation-highlight";

/** Collapse whitespace for fuzzy matching against PDF text layers. */
export function normalizeForPdfMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/-\s+/g, "")
    .trim();
}

function pickSearchSnippet(normalized: string): string {
  if (normalized.length <= 160) return normalized;
  return normalized.slice(0, 160);
}

function findMatchIndex(haystack: string, needle: string): number {
  if (!needle) return -1;
  let idx = haystack.indexOf(needle);
  if (idx !== -1) return idx;

  const shorter = needle.slice(0, Math.max(40, Math.floor(needle.length * 0.55)));
  idx = haystack.indexOf(shorter);
  if (idx !== -1) return idx;

  const words = needle.split(" ").filter(Boolean);
  if (words.length >= 4) {
    const phrase = words.slice(0, 4).join(" ");
    idx = haystack.indexOf(phrase);
  }
  return idx;
}

export function clearCitationHighlights(root: ParentNode): void {
  root.querySelectorAll(`[${HIGHLIGHT_ATTR}]`).forEach((node) => {
    node.classList.remove("citation-highlight");
    node.removeAttribute(HIGHLIGHT_ATTR);
  });
}

/**
 * Highlights the cited passage in a react-pdf text layer under `pageRoot`.
 */
export function highlightCitationPassage(
  pageRoot: HTMLElement,
  passage: string
): boolean {
  const textLayer = pageRoot.querySelector(".react-pdf__Page__textContent");
  if (!textLayer || !passage.trim()) return false;

  clearCitationHighlights(pageRoot);

  const needle = pickSearchSnippet(normalizeForPdfMatch(passage));
  const spans = Array.from(textLayer.querySelectorAll("span"));
  if (spans.length === 0) return false;

  let fullText = "";
  const segments: { start: number; end: number; el: HTMLSpanElement }[] = [];

  for (const span of spans) {
    const part = span.textContent ?? "";
    const start = fullText.length;
    fullText += part;
    segments.push({ start, end: fullText.length, el: span });
  }

  const haystack = normalizeForPdfMatch(fullText);
  const matchStart = findMatchIndex(haystack, needle);
  if (matchStart === -1) return false;

  const matchEnd = matchStart + needle.length;

  for (const { start, end, el } of segments) {
    if (end > matchStart && start < matchEnd) {
      el.classList.add("citation-highlight");
      el.setAttribute(HIGHLIGHT_ATTR, "true");
    }
  }

  return textLayer.querySelector(`[${HIGHLIGHT_ATTR}]`) !== null;
}

export function scrollCitationHighlightIntoView(
  pageRoot: HTMLElement,
  scrollContainer: HTMLElement | null
): void {
  const first = pageRoot.querySelector(`[${HIGHLIGHT_ATTR}]`) as HTMLElement | null;
  if (!first) return;

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = first.getBoundingClientRect();
    const offset =
      targetRect.top -
      containerRect.top +
      scrollContainer.scrollTop -
      scrollContainer.clientHeight * 0.35;
    scrollContainer.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
    return;
  }

  first.scrollIntoView({ behavior: "smooth", block: "center" });
}
