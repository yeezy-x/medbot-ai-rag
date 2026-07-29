/** Turn [1] markers in assistant text into in-page citation anchor links. */
export function linkifyCitationMarkers(content: string, citationCount: number): string {
  if (citationCount <= 0) return content;
  return content.replace(/\[(\d+)\]/g, (match, raw) => {
    const index = Number.parseInt(raw, 10);
    if (Number.isNaN(index) || index < 1 || index > citationCount) return match;
    return `[${raw}](#citation-${index})`;
  });
}
