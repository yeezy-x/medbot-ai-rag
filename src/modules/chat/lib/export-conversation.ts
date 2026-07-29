import type { Message } from "@/modules/chat/types/chat.types";

export function conversationToMarkdown(
  title: string,
  messages: Message[]
): string {
  const lines: string[] = [`# ${title || "MedBot conversation"}`, ""];
  for (const m of messages) {
    const who = m.role === "USER" ? "You" : m.role === "ASSISTANT" ? "MedBot" : "System";
    lines.push(`## ${who}`, "", m.content.trim(), "");
    if (m.citations?.length) {
      lines.push("### Sources", "");
      m.citations.forEach((c, i) => {
        lines.push(
          `${i + 1}. ${c.sourceTitle}${c.pageNumber ? ` (p. ${c.pageNumber})` : ""}`
        );
      });
      lines.push("");
    }
  }
  return lines.join("\n").trimEnd() + "\n";
}

export function downloadMarkdown(filename: string, body: string) {
  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
